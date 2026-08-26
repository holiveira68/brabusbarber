import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  // Visão geral para o painel: faturamento do mês, taxa de comparecimento,
  // serviço mais vendido e agendamentos de hoje.
  async getDashboardSummary() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [concluidosNoMes, faltasNoMes, agendamentosHoje, servicos] =
      await Promise.all([
        this.prisma.appointment.findMany({
          where: {
            date: { gte: startOfMonth },
            status: AppointmentStatus.CONCLUIDO,
          },
          include: { service: true },
        }),
        this.prisma.appointment.count({
          where: { date: { gte: startOfMonth }, status: AppointmentStatus.FALTOU },
        }),
        this.prisma.appointment.count({
          where: { date: { gte: today, lt: tomorrow } },
        }),
        this.prisma.service.findMany({
          include: { _count: { select: { appointments: true } } },
          orderBy: { appointments: { _count: 'desc' } },
          take: 5,
        }),
      ]);

    const faturamentoMes = concluidosNoMes.reduce(
      (total, appt) => total + Number(appt.service.price),
      0,
    );

    const totalNoMes = concluidosNoMes.length + faltasNoMes;
    const taxaComparecimento =
      totalNoMes > 0 ? Math.round((concluidosNoMes.length / totalNoMes) * 100) : 100;

    return {
      faturamentoMes,
      taxaComparecimento,
      agendamentosHoje,
      servicosMaisVendidos: servicos.map((s) => ({
        nome: s.name,
        totalAgendamentos: s._count.appointments,
      })),
    };
  }

  // Desempenho por barbeiro (usado no relatório gerencial completo)
  async getBarberPerformance() {
    const barbers = await this.prisma.barberProfile.findMany({
      include: {
        user: { select: { name: true } },
        appointments: { include: { service: true } },
      },
    });

    return barbers.map((barber) => {
      const concluidos = barber.appointments.filter(
        (a) => a.status === AppointmentStatus.CONCLUIDO,
      );
      const faltas = barber.appointments.filter(
        (a) => a.status === AppointmentStatus.FALTOU,
      );
      const faturamento = concluidos.reduce(
        (total, a) => total + Number(a.service.price),
        0,
      );

      return {
        barbeiro: barber.user.name,
        atendimentosConcluidos: concluidos.length,
        faltas: faltas.length,
        faturamentoGerado: faturamento,
      };
    });
  }
}
