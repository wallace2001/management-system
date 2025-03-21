import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrdersService } from '../..//orders/orders.service';
import { PrismaService } from 'src/prisma/prisma.service';

const mockPrisma = {
  product: {
    findMany: jest.fn(),
    update: jest.fn(),
  },
  order: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
};

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should create an order successfully', async () => {
    const dto = {
      products: { 'p1': 2 },
      status: OrderStatus.PENDING,
    };

    mockPrisma.product.findMany.mockResolvedValue([
      { id: 'p1', name: 'Mouse', price: 50, stockQuantity: 10 },
    ]);

    mockPrisma.order.create.mockResolvedValue({
      id: 'o1',
      ...dto,
      total: 100,
      products: [],
    });

    const result = await service.create(dto as any);
    expect(result.total).toBe(100);
    expect(mockPrisma.order.create).toHaveBeenCalled();
  });

  it('should throw if product stock is insufficient (COMPLETED)', async () => {
    const dto = {
      products: { 'p1': 5 },
      status: OrderStatus.COMPLETED,
    };

    mockPrisma.product.findMany.mockResolvedValue([
      { id: 'p1', name: 'Keyboard', price: 100, stockQuantity: 2 },
    ]);

    await expect(service.create(dto as any)).rejects.toThrow(BadRequestException);
  });

  it('should throw if order not found on findOne', async () => {
    mockPrisma.order.findUnique.mockResolvedValue(null);
    await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
  });
});
