import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrderDto, userId: string) {
    const productIds = Object.keys(dto.products);

    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException('Some products were not found.');
    }

    let total = 0;

    for (const product of products) {
      const requestedQty = dto.products[product.id];

      if (
        dto.status === OrderStatus.COMPLETED &&
        product.stockQuantity < requestedQty
      ) {
        throw new BadRequestException(
          `Product ${product.name} does not have enough stock.`,
        );
      }

      total += requestedQty * product.price;
    }

    if (dto.status === OrderStatus.COMPLETED) {
      for (const product of products) {
        const newQty = product.stockQuantity - dto.products[product.id];
        await this.prisma.product.update({
          where: { id: product.id },
          data: { stockQuantity: newQty },
        });
      }
    }

    const order = await this.prisma.order.create({
      data: {
        total,
        status: dto.status,
        userId, // ✅ associando o pedido ao usuário autenticado
        products: {
          create: productIds.map((productId) => ({
            productId,
            quantity: dto.products[productId],
          })),
        },
      },
      include: {
        products: {
          include: { product: true },
        },
      },
    });

    return order;
  }

  async findAll() {
    return this.prisma.order.findMany({
      include: {
        user: true, // ✅ inclui dados do usuário no retorno
        products: {
          include: { product: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        products: {
          include: { product: true },
        },
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}
