import { IsBoolean, IsInt, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsInt()
  @Min(5, { message: 'A duração mínima é de 5 minutos' })
  durationMinutes: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
