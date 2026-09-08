import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { AppointmentStatus, Role } from '@prisma/client';

const appointmentInclude = {
  client: { select: { id: true, name: true, phone: true, email: true } },
  barber: { include: { user: { select: { id: true, name: true } } } },
  service: true,
  review: true,
};

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  // Soma minutos a um horário "HH:mm" e devolve outro "HH:mm"
  private addMinutes(time: string, minutes: number): string {
    const [h, m] = time.split(':').map(Number);
    const total = h * 60 + m + minutes;
    const newH = Math.floor(total / 60) % 24;
    const newM = total % 60;
    return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
  }

  private timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  async create(clientId: number, dto: CreateAppointmentDto) {
    const service = await this.prisma.service.findUnique({
      where: { id: dto.serviceId },
    });
    if (!service || !service.active) {
      throw new NotFoundException('Serviço não encontrado ou indisponível');
    }

    const barber = await this.prisma.barberProfile.findUnique({
      where: { id: dto.barberId },
    });
    if (!barber || !barber.active) {
      throw new NotFoundException('Barbeiro não encontrado ou indisponível');
    }

    const requestedDate = new Date(`${dto.date}T00:00:00`);
    const weekday = requestedDate.getDay();

    const workingHour = await this.prisma.workingHour.findUnique({
      where: { barberId_weekday: { barberId: dto.barberId, weekday } },
    });
    if (!workingHour) {
      throw new BadRequestException('O barbeiro não atende neste dia da semana');
    }

    const endTime = this.addMinutes(dto.startTime, service.durationMinutes);

    // O agendamento precisa caber dentro do expediente do barbeiro
    if (
      this.timeToMinutes(dto.startTime) < this.timeToMinutes(workingHour.startTime) ||
      this.timeToMinutes(endTime) > this.timeToMinutes(workingHour.endTime)
    ) {
      throw new BadRequestException(
        `Horário fora do expediente do barbeiro (${workingHour.startTime} às ${workingHour.endTime})`,
      );
    }

    // Verifica sobreposição com agendamentos já existentes do barbeiro nesse dia
    const existingAppointments = await this.prisma.appointment.findMany({
      where: {
        barberId: dto.barberId,
        date: requestedDate,
        status: { in: [AppointmentStatus.PENDENTE, AppointmentStatus.CONFIRMADO] },
      },
    });

    const newStart = this.timeToMinutes(dto.startTime);
    const newEnd = this.timeToMinutes(endTime);

    const hasConflict = existingAppointments.some((appt) => {
      const apptStart = this.timeToMinutes(appt.startTime);
      const apptEnd = this.timeToMinutes(appt.endTime);
      return newStart < apptEnd && apptStart < newEnd;
    });

    if (hasConflict) {
      throw new BadRequestException('Este horário já está ocupado. Escolha outro.');
    }

    return this.prisma.appointment.create({
      data: {
        clientId,
        barberId: dto.barberId,
        serviceId: dto.serviceId,
        date: requestedDate,
        startTime: dto.startTime,
        endTime,
        notes: dto.notes,
      },
      include: appointmentInclude,
    });
  }

  // Retorna os horários de "startTime" possíveis (livres) para um barbeiro/serviço/data
  async getAvailability(barberId: number, serviceId: number, date: string) {
    const service = await this.prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) throw new NotFoundException('Serviço não encontrado');

    const requestedDate = new Date(`${date}T00:00:00`);
    const weekday = requestedDate.getDay();

    const workingHour = await this.prisma.workingHour.findUnique({
      where: { barberId_weekday: { barberId, weekday } },
    });
    if (!workingHour) return [];

    const existingAppointments = await this.prisma.appointment.findMany({
      where: {
        barberId,
        date: requestedDate,
        status: { in: [AppointmentStatus.PENDENTE, AppointmentStatus.CONFIRMADO] },
      },
    });

    const slots: string[] = [];
    const step = 15; // gera opções a cada 15 minutos
    let cursor = this.timeToMinutes(workingHour.startTime);
    const limit = this.timeToMinutes(workingHour.endTime);

    while (cursor + service.durationMinutes <= limit) {
      const slotStart = cursor;
      const slotEnd = cursor + service.durationMinutes;

      const conflict = existingAppointments.some((appt) => {
        const apptStart = this.timeToMinutes(appt.startTime);
        const apptEnd = this.timeToMinutes(appt.endTime);
        return slotStart < apptEnd && apptStart < slotEnd;
      });

      if (!conflict) {
        const h = Math.floor(slotStart / 60);
        const m = slotStart % 60;
        slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }

      cursor += step;
    }

    return slots;
  }

  findAll(filters: { barberId?: number; clientId?: number; date?: string }) {
    return this.prisma.appointment.findMany({
      where: {
        barberId: filters.barberId,
        clientId: filters.clientId,
        date: filters.date ? new Date(`${filters.date}T00:00:00`) : undefined,
      },
      include: appointmentInclude,
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  }

  async findOne(id: number) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: appointmentInclude,
    });
    if (!appointment) throw new NotFoundException('Agendamento não encontrado');
    return appointment;
  }

  async updateStatus(
    id: number,
    dto: UpdateAppointmentStatusDto,
    requester: { userId: number; role: Role },
  ) {
    const appointment = await this.findOne(id);

    // Cliente só pode cancelar o próprio agendamento
    if (requester.role === Role.CLIENTE) {
      const isOwner = appointment.clientId === requester.userId;
      const isCancel = dto.status === AppointmentStatus.CANCELADO;
      if (!isOwner || !isCancel) {
        throw new ForbiddenException('Você só pode cancelar seus próprios agendamentos');
      }
    }

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: { status: dto.status },
      include: appointmentInclude,
    });

    // Dispara notificação push assíncrona para o cliente
    this.notificationsService.notifyStatusChange(id, dto.status).catch(() => {});

    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.appointment.delete({ where: { id } });
    return { message: 'Agendamento removido com sucesso' };
  }
}
