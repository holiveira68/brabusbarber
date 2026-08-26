import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateBarberDto } from './dto/update-barber.dto';
import { SetWorkingHoursDto } from './dto/set-working-hours.dto';

const barberInclude = {
  user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
  workingHours: true,
  services: { include: { service: true } },
};

@Injectable()
export class BarbersService {
  constructor(private prisma: PrismaService) {}

  // Lista pública — usada pelo app para o cliente escolher o barbeiro
  findAll(onlyActive = true) {
    return this.prisma.barberProfile.findMany({
      where: onlyActive ? { active: true } : undefined,
      include: barberInclude,
    });
  }

  async findOne(id: number) {
    const barber = await this.prisma.barberProfile.findUnique({
      where: { id },
      include: barberInclude,
    });
    if (!barber) throw new NotFoundException('Barbeiro não encontrado');
    return barber;
  }

  async findByUserId(userId: number) {
    const barber = await this.prisma.barberProfile.findUnique({
      where: { userId },
      include: barberInclude,
    });
    if (!barber) throw new NotFoundException('Perfil de barbeiro não encontrado');
    return barber;
  }

  async update(id: number, dto: UpdateBarberDto) {
    await this.findOne(id);
    const { serviceIds, ...rest } = dto;

    await this.prisma.barberProfile.update({ where: { id }, data: rest });

    if (serviceIds) {
      // Substitui totalmente a lista de serviços vinculados ao barbeiro
      await this.prisma.serviceOnBarber.deleteMany({ where: { barberId: id } });
      await this.prisma.serviceOnBarber.createMany({
        data: serviceIds.map((serviceId) => ({ barberId: id, serviceId })),
      });
    }

    return this.findOne(id);
  }

  async setWorkingHours(id: number, dto: SetWorkingHoursDto) {
    await this.findOne(id);
    // Substitui a grade de horários inteira do barbeiro
    await this.prisma.workingHour.deleteMany({ where: { barberId: id } });
    await this.prisma.workingHour.createMany({
      data: dto.hours.map((h) => ({ ...h, barberId: id })),
    });
    return this.findOne(id);
  }

  // Retorna os horários de trabalho de um dia específico da semana
  async getWorkingHourForWeekday(barberId: number, weekday: number) {
    return this.prisma.workingHour.findUnique({
      where: { barberId_weekday: { barberId, weekday } },
    });
  }
}
