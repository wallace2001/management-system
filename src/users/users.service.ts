import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly repo: UsersRepository) {}

  async createUser(
    username: string,
    password: string,
    role: 'ADMIN' | 'USER' = 'USER',
  ) {
    const hashed = await bcrypt.hash(password, 10);

    try {
      return await this.repo.create({ username, password: hashed, role });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Username already exists');
      }
      throw error;
    }
  }

  async deleteUser(id: string) {
    return this.repo.delete(id);
  }

  async updateUser(id: string, data: { username?: string; role?: 'ADMIN' | 'USER' }) {
    return this.repo.update(id, data);
  }

  async findByUsername(username: string) {
    return this.repo.findByUsername(username);
  }

  async findById(id: string) {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findAll() {
    return await this.repo.findAll();
  }
}
