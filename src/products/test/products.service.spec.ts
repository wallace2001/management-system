import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';

const mockPrisma = {
  product: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should create a product', async () => {
    const dto = {
      name: 'Test Product',
      category: 'Category A',
      description: 'Description',
      price: 10,
      stockQuantity: 100,
    };
    mockPrisma.product.create.mockResolvedValue({ id: '123', ...dto });

    const result = await service.create(dto);
    expect(result).toEqual({ id: '123', ...dto });
  });

  it('should throw if product not found', async () => {
    mockPrisma.product.findUnique.mockResolvedValue(null);
    await expect(service.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
  });
});
