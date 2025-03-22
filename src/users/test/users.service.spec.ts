import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { UsersRepository } from '../users.repository';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: jest.Mocked<UsersRepository>;

  beforeEach(async () => {
    const mockUsersRepository: Partial<jest.Mocked<UsersRepository>> = {
      create: jest.fn(),
      findByUsername: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get(UsersRepository);
  });

  it('should create a user with hashed password', async () => {
    usersRepository.create.mockImplementation(async ({ username, password, role }) => ({
      id: 'user-id',
      username,
      password,
      role,
      createdAt: new Date(),
    }));

    const user = await service.createUser('unittest', 'password123');

    expect(user).toBeDefined();
    expect(user.username).toBe('unittest');
    expect(user.password).not.toBe('password123');
    expect(await bcrypt.compare('password123', user.password)).toBe(true);
  });

  it('should find a user by username', async () => {
    usersRepository.findByUsername.mockResolvedValue({
      id: 'user-id',
      username: 'unittest',
      password: 'hashed',
      role: 'USER',
      createdAt: new Date(),
    });

    const found = await service.findByUsername('unittest');
    expect(found).toBeDefined();
    expect(found?.username).toBe('unittest');
  });

  it('should return null if username not found', async () => {
    usersRepository.findByUsername.mockResolvedValue(null);
    const user = await service.findByUsername('nonexistent');
    expect(user).toBeNull();
  });

  it('should find a user by id', async () => {
    const now = new Date();
    usersRepository.findById.mockResolvedValue({
      id: 'user-id',
      username: 'unittest',
      role: 'USER',
      createdAt: now,
    });

    const user = await service.findById('user-id');
    expect(user).toBeDefined();
    expect(user.id).toBe('user-id');
  });

  it('should throw NotFoundException if user id not found', async () => {
    usersRepository.findById.mockResolvedValue(null);

    await expect(service.findById('invalid-id')).rejects.toThrow(NotFoundException);
  });
});
