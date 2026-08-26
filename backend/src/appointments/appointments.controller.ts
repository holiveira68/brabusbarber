import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  // O cliente (via app) cria o próprio agendamento
  @Post()
  @Roles(Role.CLIENTE)
  create(
    @CurrentUser() user: { userId: number },
    @Body() dto: CreateAppointmentDto,
  ) {
    return this.appointmentsService.create(user.userId, dto);
  }

  // Consulta horários livres para um barbeiro/serviço/data — usado antes de agendar
  @Get('disponibilidade')
  @Roles(Role.CLIENTE, Role.ADMIN, Role.BARBEIRO)
  getAvailability(
    @Query('barberId', ParseIntPipe) barberId: number,
    @Query('serviceId', ParseIntPipe) serviceId: number,
    @Query('date') date: string,
  ) {
    return this.appointmentsService.getAvailability(barberId, serviceId, date);
  }

  // ADMIN/BARBEIRO veem a agenda (todos ou filtrando por barbeiro/data);
  // CLIENTE vê apenas os próprios agendamentos (filtro aplicado automaticamente)
  @Get()
  @Roles(Role.ADMIN, Role.BARBEIRO, Role.CLIENTE)
  findAll(
    @CurrentUser() user: { userId: number; role: Role },
    @Query('barberId') barberId?: string,
    @Query('date') date?: string,
  ) {
    return this.appointmentsService.findAll({
      barberId: barberId ? Number(barberId) : undefined,
      clientId: user.role === Role.CLIENTE ? user.userId : undefined,
      date,
    });
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.BARBEIRO, Role.CLIENTE)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentsService.findOne(id);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.BARBEIRO, Role.CLIENTE)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAppointmentStatusDto,
    @CurrentUser() user: { userId: number; role: Role },
  ) {
    return this.appointmentsService.updateStatus(id, dto, user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentsService.remove(id);
  }
}
