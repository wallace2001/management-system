import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';

describe('ProductsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let productId: string;

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
        name: 'E2E Mouse',
        category: 'Tech',
        description: 'Mouse testing',
        price: 25,
        stockQuantity: 10,
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

  it('/GET products', async () => {
    const res = await request(app.getHttpServer()).get('/products');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });

  it('/DELETE product', async () => {
    const res = await request(app.getHttpServer()).delete(`/products/${productId}`);
    expect(res.status).toBe(200);
  });
});
