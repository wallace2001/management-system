import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, PrismaService],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);

    await prisma.user.deleteMany({ where: { username: 'unittest' } });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { username: 'unittest' } });
  });

  it('should create a user with hashed password', async () => {
    const user = await service.createUser('unittest', 'password123');

    expect(user).toBeDefined();
    expect(user.username).toBe('unittest');
    expect(user.password).not.toBe('password123');

    const isHash = await bcrypt.compare('password123', user.password);
    expect(isHash).toBe(true);
  });

  it('should find a user by username', async () => {
    await service.createUser('unittest', 'secret');
    const found = await service.findByUsername('unittest');

    expect(found).toBeDefined();
    if (!found) return;
    expect(found.username).toBe('unittest');
  });

  it('should return null if username not found', async () => {
    const user = await service.findByUsername('nonexistent');
    expect(user).toBeNull();
  });

  it('should find a user by id', async () => {
    const user = await service.createUser('unittest', 'password');
    const result = await service.findById(user.id);

    expect(result).toBeDefined();
    expect(result.id).toBe(user.id);
  });

  it('should throw NotFoundException if user id not found', async () => {
    await expect(service.findById('invalid-id')).rejects.toThrow(NotFoundException);
  });
});
