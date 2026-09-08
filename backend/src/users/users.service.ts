import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '@prisma/client';

// Campos seguros que devem retornar na resposta da API
const safeSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  avatarUrl: true,
  pushToken: true,
  createdAt: true,
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { ...dto, password: hashedPassword },
      select: safeSelect,
    });

    // Se o usuário criado for BARBEIRO, cria o perfil de barbeiro vinculado
    if (dto.role === Role.BARBEIRO) {
      await this.prisma.barberProfile.create({ data: { userId: user.id } });
    }

    return user;
  }

  findAll(role?: Role, search?: string) {
    const where: any = {};
    if (role) {
      where.role = role;
    }
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
      ];
    }

    return this.prisma.user.findMany({
      where,
      select: safeSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: safeSelect,
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async update(id: number, dto: UpdateUserDto) {
    const existing = await this.findOne(id);
    const dataToUpdate: any = { ...dto };

    if (dto.password) {
      dataToUpdate.password = await bcrypt.hash(dto.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: safeSelect,
    });

    // Se mudou o papel para BARBEIRO e não possui perfil, cria um
    if (dto.role === Role.BARBEIRO && existing.role !== Role.BARBEIRO) {
      const profileExists = await this.prisma.barberProfile.findUnique({
        where: { userId: id },
      });
      if (!profileExists) {
        await this.prisma.barberProfile.create({ data: { userId: id } });
      }
    }

    return updatedUser;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
    return { message: 'Usuário removido com sucesso' };
  }
}
