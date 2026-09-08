import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BarbersModule } from './barbers/barbers.module';
import { ServicesModule } from './services/services.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { ReportsModule } from './reports/reports.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // .env disponível em todo o app
    ScheduleModule.forRoot(), // Habilita tarefas agendadas (@Cron)
    PrismaModule,
    AuthModule,
    UsersModule,
    BarbersModule,
    ServicesModule,
    AppointmentsModule,
    ReportsModule,
    NotificationsModule,
    ReviewsModule,
  ],
})
export class AppModule {}
