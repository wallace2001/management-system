import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrdersService } from '../../orders/orders.service';
import { CreateOrderDto } from '../../orders/dto/create-order.dto';
import { OrdersRepository } from '../../orders/orders.repository';

describe('OrdersService', () => {
  let service: OrdersService;
  let repositoryMock: Record<keyof OrdersRepository, jest.Mock>;

  beforeEach(async () => {
    repositoryMock = {
      findProductsByIds: jest.fn(),
      updateProductStock: jest.fn(),
      createOrder: jest.fn(),
      findAllOrders: jest.fn(),
      findOrderById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: OrdersRepository, useValue: repositoryMock },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    jest.clearAllMocks();
  });

  it('should create an order successfully', async () => {
    const dto: CreateOrderDto = {
      products: { 'p1': 2 },
      status: OrderStatus.PENDING,
    };
    const userId = 'u1';

    repositoryMock.findProductsByIds.mockResolvedValue([
      { id: 'p1', name: 'Mouse', price: 50, stockQuantity: 10 },
    ]);

    repositoryMock.createOrder.mockResolvedValue({
      id: 'o1',
      total: 100,
      status: dto.status,
      userId,
      products: [],
    });

    const result = await service.create(dto, userId);

    expect(result.total).toBe(100);
    expect(repositoryMock.createOrder).toHaveBeenCalledWith({
      total: 100,
      status: dto.status,
      userId,
      products: [{ productId: 'p1', quantity: 2 }],
    });
  });

  it('should throw if product stock is insufficient (COMPLETED)', async () => {
    const dto: CreateOrderDto = {
      products: { 'p1': 5 },
      status: OrderStatus.COMPLETED,
    };

    repositoryMock.findProductsByIds.mockResolvedValue([
      { id: 'p1', name: 'Keyboard', price: 100, stockQuantity: 2 },
    ]);

    await expect(service.create(dto, 'u1')).rejects.toThrow(BadRequestException);
  });

  it('should throw if order not found on findOne', async () => {
    repositoryMock.findOrderById.mockResolvedValue(null);
    await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
  });
});
