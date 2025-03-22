import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from 'src/products/products.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { NotFoundException } from '@nestjs/common';
import { ProductsRepository } from '../products.repository';

describe('ProductsService', () => {
  let service: ProductsService;
  let repositoryMock: Record<keyof ProductsRepository, jest.Mock>;

  beforeEach(async () => {
    repositoryMock = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };


    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: ProductsRepository, useValue: repositoryMock },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should create a product', async () => {
    const dto: CreateProductDto = {
      name: 'Test Product',
      category: 'Category A',
      description: 'Description',
      price: 10,
      stockQuantity: 100,
    };

    repositoryMock.create.mockResolvedValue({ id: '123', ...dto });

    const result = await service.create(dto);
    expect(result).toEqual({ id: '123', ...dto });
    expect(repositoryMock.create).toHaveBeenCalledWith(dto);
  });

  it('should throw if product not found', async () => {
    repositoryMock.findById.mockResolvedValue(null);

    await expect(service.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
    expect(repositoryMock.findById).toHaveBeenCalledWith('nonexistent-id');
  });

  it('should return a product if found', async () => {
    const product = {
      id: 'product-id',
      name: 'P',
      category: 'C',
      description: 'D',
      price: 10,
      stockQuantity: 1,
    };

    repositoryMock.findById.mockResolvedValue(product);

    const result = await service.findOne('product-id');
    expect(result).toEqual(product);
  });
});
