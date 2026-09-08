import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentStatus } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Salva ou atualiza o token do Expo para notificações push do usuário.
   */
  async savePushToken(userId: number, pushToken: string) {
    if (!pushToken || typeof pushToken !== 'string') {
      return;
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: { pushToken },
      select: { id: true, name: true, email: true, pushToken: true },
    });
  }

  /**
   * Envia notificação push usando a API HTTP v2 oficial do Expo Push.
   */
  async sendExpoPushNotification(
    tokens: string[],
    title: string,
    body: string,
    data: Record<string, any> = {},
  ) {
    try {
      const validTokens = tokens.filter(
        (t) => typeof t === 'string' && t.trim().length > 0,
      );

      if (validTokens.length === 0) {
        this.logger.log('Nenhum token válido do Expo para envio.');
        return;
      }

      const messages = validTokens.map((token) => ({
        to: token,
        sound: 'default',
        title,
        body,
        data,
      }));

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });

      const resData = await response.json();
      this.logger.log(`Notificação Push enviada via Expo: ${JSON.stringify(resData)}`);
      return resData;
    } catch (error) {
      this.logger.error('Erro ao conectar com servidor do Expo Push:', error);
    }
  }

  /**
   * Cron Job de Lembretes Automáticos: Executa a cada 5 minutos
   * Verificando se há agendamentos nos próximos ~60 minutos para alertar o cliente.
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleUpcomingAppointmentReminders() {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const appointments = await this.prisma.appointment.findMany({
        where: {
          date: today,
          status: { in: [AppointmentStatus.CONFIRMADO, AppointmentStatus.PENDENTE] },
        },
        include: {
          client: { select: { id: true, name: true, pushToken: true } },
          barber: { include: { user: { select: { name: true } } } },
          service: { select: { name: true } },
        },
      });

      const targetStartMin = now.getHours() * 60 + now.getMinutes() + 50;
      const targetEndMin = now.getHours() * 60 + now.getMinutes() + 70;

      for (const appt of appointments) {
        if (!appt.client?.pushToken) continue;

        const [h, m] = appt.startTime.split(':').map(Number);
        const apptMin = h * 60 + m;

        if (apptMin >= targetStartMin && apptMin <= targetEndMin) {
          this.logger.log(
            `Disparando lembrete automático para ${appt.client.name} - Agendamento das ${appt.startTime}`,
          );

          await this.sendExpoPushNotification(
            [appt.client.pushToken],
            '⏰ Lembrete de Agendamento BRABUS BARBER',
            `Olá ${appt.client.name}, seu agendamento de ${appt.service.name} com ${appt.barber.user.name} é hoje às ${appt.startTime}!`,
            { appointmentId: appt.id, type: 'REMINDER' },
          );
        }
      }
    } catch (error) {
      this.logger.error('Erro na execução da Cron de lembretes:', error);
    }
  }

  /**
   * Dispara notificação push quando o status do agendamento mudar.
   */
  async notifyStatusChange(appointmentId: number, newStatus: string) {
    try {
      const appt = await this.prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          client: { select: { name: true, pushToken: true } },
          barber: { include: { user: { select: { name: true } } } },
          service: { select: { name: true } },
        },
      });

      if (!appt || !appt.client?.pushToken) return;

      let title = 'Atualização no seu Agendamento';
      let body = `Seu agendamento de ${appt.service.name} mudou para ${newStatus}.`;

      if (newStatus === AppointmentStatus.CONFIRMADO) {
        title = '✅ Agendamento Confirmado!';
        body = `Seu atendimento de ${appt.service.name} com ${appt.barber.user.name} está confirmado para às ${appt.startTime}.`;
      } else if (newStatus === AppointmentStatus.CANCELADO) {
        title = '❌ Agendamento Cancelado';
        body = `Seu agendamento de ${appt.service.name} das ${appt.startTime} foi cancelado.`;
      } else if (newStatus === AppointmentStatus.CONCLUIDO) {
        title = '💈 Atendimento Concluído!';
        body = `Obrigado por escolher a BRABUS BARBER! Avalie o atendimento prestado por ${appt.barber.user.name}.`;
      }

      await this.sendExpoPushNotification(
        [appt.client.pushToken],
        title,
        body,
        { appointmentId, status: newStatus, type: 'STATUS_CHANGE' },
      );
    } catch (error) {
      this.logger.error('Erro ao notificar alteração de status:', error);
    }
  }
}
