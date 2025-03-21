import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

describe('OrdersController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let productId: string;
  let orderId: string;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get(PrismaService);

    await prisma.orderProduct.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();

    const product = await prisma.product.create({
      data: {
        name: 'Test Product',
        category: 'Test',
        description: 'Order test',
        price: 30,
        stockQuantity: 100,
      },
    });

    productId = product.id;
  });

  afterEach(async () => {
    await prisma.orderProduct.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await app.close();
  });

  it('/POST orders', async () => {
    const res = await request(app.getHttpServer())
      .post('/orders')
      .send({
        products: { [productId]: 2 },
        status: OrderStatus.COMPLETED,
      });

    expect(res.status).toBe(201);
    expect(res.body.total).toBe(60);
    orderId = res.body.id;
  });

  it('/GET order by id', async () => {
    const order = await prisma.order.create({
      data: {
        status: OrderStatus.PENDING,
        total: 0,
        products: {
          create: [{ productId, quantity: 1 }],
        },
      },
    });

    const res = await request(app.getHttpServer())
      .get(`/orders/${order.id}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(order.id);
  });
});
