
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import * as request from 'supertest';
import { PrismaService } from 'src/prisma/prisma.service';

describe('ProductsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let createdId: string;

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
    await prisma.product.deleteMany(); // Cleanup
    await app.close();
  });

  it('/POST products - should create a product', async () => {
    const res = await request(app.getHttpServer())
      .post('/products')
      .send({
        name: 'Integration Test Product',
        category: 'Test',
        description: 'Just for test',
        price: 99.99,
        stockQuantity: 10,
      })
      .expect(201);

    createdId = res.body.id;
    expect(res.body.name).toBe('Integration Test Product');
  });

  it('/GET products/:id - should return created product', async () => {
    const res = await request(app.getHttpServer())
      .get(`/products/${createdId}`)
      .expect(200);

    expect(res.body).toHaveProperty('id', createdId);
    expect(res.body.name).toBe('Integration Test Product');
  });

  it('/PUT products/:id - should update product', async () => {
    const res = await request(app.getHttpServer())
      .put(`/products/${createdId}`)
      .send({ price: 150 })
      .expect(200);

    expect(res.body.price).toBe(150);
  });

  it('/DELETE products/:id - should delete product', async () => {
    await request(app.getHttpServer())
      .delete(`/products/${createdId}`)
      .expect(200);
  });
});
