// src/orders/orders.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderStatus, Product } from '@prisma/client';

@Injectable()
export class OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findProductsByIds(ids: string[]) {
    return this.prisma.product.findMany({
      where: { id: { in: ids } },
    });
  }

  async updateProductStock(productId: string, newQty: number) {
    return this.prisma.product.update({
      where: { id: productId },
      data: { stockQuantity: newQty },
    });
  }

  async createOrder(data: {
    total: number;
    status: OrderStatus;
    userId: string;
    products: { productId: string; quantity: number }[];
  }) {
    return this.prisma.order.create({
      data: {
        total: data.total,
        status: data.status,
        userId: data.userId,
        products: {
          create: data.products,
        },
      },
      include: {
        products: {
          include: { product: true },
        },
      },
    });
  }

  async findAllOrders() {
    return this.prisma.order.findMany({
      include: {
        user: true,
        products: { include: { product: true } },
      },
    });
  }

  async findOrderById(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        products: { include: { product: true } },
      },
    });
  }

  async delete(id: string) {
    await this.prisma.orderProduct.deleteMany({
      where: { orderId: id },
    });

    return this.prisma.order.delete({
      where: { id },
    });
  }

  async updateStock(
    productId: string,
    quantityChange: number,
  ): Promise<Product> {
    return this.prisma.product.update({
      where: { id: productId },
      data: { stockQuantity: { increment: quantityChange } },
    });
  }

  updateStatus(id: string, status: OrderStatus) {
    return this.prisma.order.update({
      where: { id },
      data: { status },
    });
  }
}
