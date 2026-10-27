import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentStatus } from '@prisma/client';

/** Converte uma string ISO opcional em Date, retornando undefined se ausente */
function parseDate(iso?: string): Date | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? undefined : d;
}

/** Monta o filtro de intervalo de datas para o campo `date` */
function dateRange(startDate?: string, endDate?: string) {
  const gte = parseDate(startDate);
  const lte = parseDate(endDate);
  if (gte || lte) {
    return { ...(gte ? { gte } : {}), ...(lte ? { lte } : {}) };
  }
  // Sem filtro fornecido → mês atual (comportamento padrão)
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  return { gte: startOfMonth };
}

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Resumo geral para o painel.
   * Aceita intervalo de datas opcionais (startDate / endDate ISO).
   * Calcula: faturamento, taxa de comparecimento (%), serviços mais vendidos
   * e total de agendamentos no período.
   */
  async getDashboardSummary(startDate?: string, endDate?: string) {
    const range = dateRange(startDate, endDate);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      concluidos,
      faltas,
      cancelados,
      pendentes,
      confirmados,
      agendamentosHoje,
      servicos,
    ] = await Promise.all([
      // Concluídos no período
      this.prisma.appointment.findMany({
        where: { date: range, status: AppointmentStatus.CONCLUIDO },
        include: { service: true },
      }),
      // Faltas no período
      this.prisma.appointment.count({
        where: { date: range, status: AppointmentStatus.FALTOU },
      }),
      // Cancelados no período
      this.prisma.appointment.count({
        where: { date: range, status: AppointmentStatus.CANCELADO },
      }),
      // Pendentes no período
      this.prisma.appointment.count({
        where: { date: range, status: AppointmentStatus.PENDENTE },
      }),
      // Confirmados no período
      this.prisma.appointment.count({
        where: { date: range, status: AppointmentStatus.CONFIRMADO },
      }),
      // Agendamentos de hoje (fixo, independente do filtro)
      this.prisma.appointment.count({
        where: { date: { gte: today, lt: tomorrow } },
      }),
      // Serviços mais vendidos no período (concluídos)
      this.prisma.service.findMany({
        include: {
          _count: {
            select: {
              appointments: {
                where: { date: range, status: AppointmentStatus.CONCLUIDO },
              },
            },
          },
        },
        orderBy: { appointments: { _count: 'desc' } },
        take: 5,
      }),
    ]);

    const faturamentoPeriodo = concluidos.reduce(
      (total, appt) => total + Number(appt.service.price),
      0,
    );

    // Taxa de comparecimento: concluídos / (concluídos + faltas) × 100
    const totalRealizados = concluidos.length + faltas;
    const taxaComparecimento =
      totalRealizados > 0
        ? Math.round((concluidos.length / totalRealizados) * 100)
        : 100;

    const totalNoPeriodo =
      concluidos.length + faltas + cancelados + pendentes + confirmados;

    return {
      periodo: {
        inicio: startDate ?? null,
        fim: endDate ?? null,
      },
      faturamentoPeriodo,
      taxaComparecimento,
      agendamentosConcluidos: concluidos.length,
      agendamentosComFalta: faltas,
      agendamentosCancelados: cancelados,
      agendamentosPendentes: pendentes,
      agendamentosConfirmados: confirmados,
      totalNoPeriodo,
      agendamentosHoje,
      servicosMaisVendidos: servicos
        .map((s) => ({
          nome: s.name,
          totalAgendamentos: s._count.appointments,
        }))
        .filter((s) => s.totalAgendamentos > 0),
    };
  }

  /**
   * Desempenho por barbeiro.
   * Aceita intervalo de datas opcionais (startDate / endDate ISO).
   */
  async getBarberPerformance(startDate?: string, endDate?: string) {
    const range = dateRange(startDate, endDate);

    const barbers = await this.prisma.barberProfile.findMany({
      include: {
        user: { select: { name: true } },
        appointments: {
          where: { date: range },
          include: { service: true },
        },
      },
    });

    return barbers.map((barber) => {
      const concluidos = barber.appointments.filter(
        (a) => a.status === AppointmentStatus.CONCLUIDO,
      );
      const faltas = barber.appointments.filter(
        (a) => a.status === AppointmentStatus.FALTOU,
      );
      const cancelados = barber.appointments.filter(
        (a) => a.status === AppointmentStatus.CANCELADO,
      );
      const faturamento = concluidos.reduce(
        (total, a) => total + Number(a.service.price),
        0,
      );
      const totalRealizados = concluidos.length + faltas.length;
      const taxaComparecimento =
        totalRealizados > 0
          ? Math.round((concluidos.length / totalRealizados) * 100)
          : 100;

      return {
        barbeiro: barber.user.name,
        atendimentosConcluidos: concluidos.length,
        faltas: faltas.length,
        cancelados: cancelados.length,
        taxaComparecimento,
        faturamentoGerado: faturamento,
      };
    });
  }
}
