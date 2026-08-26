import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateBarberDto {
  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  specialties?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  // IDs dos serviços que este barbeiro realiza
  @IsOptional()
  @IsArray()
  serviceIds?: number[];
}
