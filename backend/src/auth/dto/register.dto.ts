import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsString()
  @MinLength(2, { message: 'O nome deve ter pelo menos 2 caracteres' })
  name: string;

  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;

  // Por padrão todo cadastro público vira CLIENTE.
  // Criação de BARBEIRO/ADMIN é feita por um admin autenticado (ver UsersModule).
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
