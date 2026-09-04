import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateServiceDto) {
    return this.prisma.service.create({ data: dto });
  }

  findAll(onlyActive = false) {
    return this.prisma.service.findMany({
      where: onlyActive ? { active: true } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException('Serviço não encontrado');
    return service;
  }

  async update(id: number, dto: UpdateServiceDto) {
    await this.findOne(id);
    return this.prisma.service.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);

    const appointmentsCount = await this.prisma.appointment.count({
      where: { serviceId: id },
    });

    if (appointmentsCount > 0) {
      throw new BadRequestException(
        'Este serviço possui agendamentos no histórico e não pode ser excluído permanentemente. Você pode apenas desativá-lo.',
      );
    }

    await this.prisma.service.delete({ where: { id } });
    return { message: 'Serviço excluído com sucesso' };
  }
}
