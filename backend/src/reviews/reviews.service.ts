import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { AppointmentStatus } from '@prisma/client';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(clientId: number, dto: CreateReviewDto) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: dto.appointmentId },
      include: { review: true },
    });

    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    if (appointment.clientId !== clientId) {
      throw new ForbiddenException('Você só pode avaliar seus próprios agendamentos');
    }

    if (appointment.status !== AppointmentStatus.CONCLUIDO) {
      throw new BadRequestException('Apenas atendimentos concluídos podem receber avaliação');
    }

    if (appointment.review) {
      throw new BadRequestException('Este agendamento já foi avaliado anteriormente');
    }

    return this.prisma.review.create({
      data: {
        appointmentId: dto.appointmentId,
        clientId,
        rating: dto.rating,
        comment: dto.comment,
      },
      include: {
        client: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
  }

  async getBarberReviews(barberId: number) {
    const reviews = await this.prisma.review.findMany({
      where: {
        appointment: {
          barberId,
        },
      },
      include: {
        client: { select: { id: true, name: true, avatarUrl: true } },
        appointment: {
          include: {
            service: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalCount = reviews.length;
    const averageRating =
      totalCount > 0
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / totalCount).toFixed(1))
        : 0;

    return {
      averageRating,
      totalCount,
      reviews,
    };
  }

  async findAll() {
    const reviews = await this.prisma.review.findMany({
      include: {
        client: { select: { id: true, name: true } },
        appointment: {
          include: {
            barber: { include: { user: { select: { name: true } } } },
            service: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reviews;
  }
}
