// src/users/users.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    username: string;
    password: string;
    role: 'ADMIN' | 'USER';
  }): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async findById(id: string): Promise<Partial<User> | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async findAll(): Promise<Partial<User[]> | null> {
    return this.prisma.user.findMany();
  }

  async delete(id: string): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }

  async update(id: string, data: Partial<Pick<User, 'username' | 'role'>>): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}
