import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

// Uso: @Roles(Role.ADMIN, Role.BARBEIRO) acima de uma rota
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
