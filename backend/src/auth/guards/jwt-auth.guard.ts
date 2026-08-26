import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Protege qualquer rota que exija um usuário autenticado (Bearer token válido)
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
