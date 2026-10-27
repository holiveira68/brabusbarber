import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  /** Resumo geral com filtro opcional de período (query: startDate, endDate – ISO string) */
  @Get('resumo')
  getSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getDashboardSummary(startDate, endDate);
  }

  /** Desempenho por barbeiro com filtro opcional de período */
  @Get('desempenho-barbeiros')
  getBarberPerformance(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getBarberPerformance(startDate, endDate);
  }
}
