import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Uso: async minhaRota(@CurrentUser() user: { userId: number; role: string })
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
