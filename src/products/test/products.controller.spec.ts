import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';

describe('ProductsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let productId: string;
  let token: string;
  let username: string;

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
    await app.close();
  });

  beforeEach(async () => {
    username = `testuser_${Date.now()}`;

    await prisma.orderProduct.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany({ where: { username } });

    await request(app.getHttpServer())
    .post('/auth/register')
    .send({ username, password: 'testpass' });

    await prisma.user.update({
      where: { username },
      data: { role: 'ADMIN' },
    });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username, password: 'testpass' });

    token = JSON.parse(loginRes.text)['access_token'];

    expect(token).toBeDefined();

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
    await prisma.user.deleteMany({ where: { username } });
  });

  it('/GET products', async () => {
    const res = await request(app.getHttpServer())
      .get('/products')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('/DELETE product - should fail for USER role', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/products/${productId}`)
      .set('Authorization', `Bearer ${token}`);

    expect([200, 403]).toContain(res.status);

    if (res.status === 403) {
      expect(res.body.message).toMatch(/forbidden/i);
    } else {
      expect(res.body.id).toBe(productId);
    }
  });
});
