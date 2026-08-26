import { IsDateString, IsInt, IsOptional, IsString, Matches } from 'class-validator';

export class CreateAppointmentDto {
  @IsInt()
  barberId: number;

  @IsInt()
  serviceId: number;

  @IsDateString({}, { message: 'Data inválida, use o formato AAAA-MM-DD' })
  date: string;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Horário inválido, use o formato HH:mm',
  })
  startTime: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
