import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Put, Query, UseGuards } from '@nestjs/common';
import { BarbersService } from './barbers.service';
import { UpdateBarberDto } from './dto/update-barber.dto';
import { SetWorkingHoursDto } from './dto/set-working-hours.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('barbers')
export class BarbersController {
  constructor(private barbersService: BarbersService) {}

  // Rota pública — o app precisa listar barbeiros sem estar logado como admin.
  // Por padrão só retorna barbeiros ativos (o que o cliente pode agendar).
  // O painel de gestão usa ?includeInactive=true para também enxergar
  // barbeiros desativados e poder reativá-los.
  @Get()
  findAll(@Query('includeInactive') includeInactive?: string) {
    return this.barbersService.findAll(includeInactive !== 'true');
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.barbersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBarberDto) {
    return this.barbersService.update(id, dto);
  }

  @Put(':id/horarios')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.BARBEIRO)
  setWorkingHours(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetWorkingHoursDto,
  ) {
    return this.barbersService.setWorkingHours(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.barbersService.remove(id);
  }
}
