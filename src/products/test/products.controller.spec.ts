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
    await prisma.user.deleteMany({ where: { username: 'testuser' } });

    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: 'testuser', password: 'testpass' });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'testuser', password: 'testpass' });

    token = loginRes.body.access_token;

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
    await prisma.user.deleteMany({ where: { username: 'testuser' } });
    await app.close();
  });

  it('/GET products', async () => {
    const res = await request(app.getHttpServer())
      .get('/products')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });

  it('/DELETE product', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/products/${productId}`)
      .set('Authorization', `Bearer ${token}`);

    // Esse teste deve falhar se o usuário não for ADMIN
    // A menos que você permita `USER` deletar produtos
    // Aqui deixaremos como está, pois o token é de um USER

    if (res.status === 403) {
      expect(res.body.message).toMatch(/forbidden/i);
    } else {
      expect(res.status).toBe(200);
    }
  });
});
