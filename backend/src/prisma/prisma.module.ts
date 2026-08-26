import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// @Global() permite injetar o PrismaService em qualquer módulo
// sem precisar reimportar o PrismaModule toda vez.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
