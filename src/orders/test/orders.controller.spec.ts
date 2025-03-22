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
  let token: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.orderProduct.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany({ where: { username: 'testuser' } });
    await app.close();
  });

  beforeEach(async () => {
    await prisma.orderProduct.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany({ where: { username: 'testuser' } });

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: 'testuser', password: 'testpass' });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'testuser', password: 'testpass' });

    token = loginRes.body.access_token;
    expect(token).toBeDefined();

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

  it('/POST orders', async () => {
    const res = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        products: { [productId]: 2 },
        status: OrderStatus.COMPLETED,
      });

    expect(res.status).toBe(201);
    expect(res.body.total).toBe(60);
    expect(res.body.userId).toBeDefined();
    orderId = res.body.id;
    expect(orderId).toBeDefined();
  });

  it('/GET order by id', async () => {
    const user = await prisma.user.findUnique({
      where: { username: 'testuser' },
    });

    expect(user).toBeDefined();

    const order = await prisma.order.create({
      data: {
        status: OrderStatus.PENDING,
        total: 0,
        userId: user!.id,
        products: {
          create: [{ productId, quantity: 1 }],
        },
      },
    });

    const res = await request(app.getHttpServer())
      .get(`/orders/${order.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(order.id);
    expect(res.body.userId).toBe(user!.id);
  });
});
