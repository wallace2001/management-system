import { IsEnum, IsNotEmpty, IsNumber, IsObject, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

export class CreateOrderDto {
  @ApiProperty({
    example: {
      'product-id-1': 2,
      'product-id-2': 1,
    },
  })
  @IsObject()
  @IsNotEmpty()
  products: Record<string, number>; // { productId: quantity }

  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
