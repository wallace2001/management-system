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
      updateStatus: jest.fn(),
      createOrder: jest.fn(),
      findAllOrders: jest.fn(),
      findOrderById: jest.fn(),
      updateStock: jest.fn(),
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

  it('should conclude an order and update product stock', async () => {
    const orderId = 'o1';

    repositoryMock.findOrderById.mockResolvedValue({
      id: orderId,
      status: OrderStatus.PENDING,
      total: 100,
      createdAt: new Date(),
      userId: 'user123',
      products: [{ productId: 'p1', quantity: 2 }],
    });

    repositoryMock.updateStatus.mockResolvedValue({
      id: orderId,
      status: OrderStatus.COMPLETED,
      total: 100,
      createdAt: new Date(),
      userId: 'user123',
    });

    repositoryMock.updateStock.mockResolvedValue({ id: 'p1', stockQuantity: 8 });

    const result = await service.markAsCompleted(orderId);

    if ('status' in result) {
      expect(result.status).toBe(OrderStatus.COMPLETED);
    } else {
      throw new Error('Unexpected return type');
    }

    expect(repositoryMock.updateStatus).toHaveBeenCalledWith(orderId, OrderStatus.COMPLETED);
    expect(repositoryMock.updateStock).toHaveBeenCalledWith('p1', -2);
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
