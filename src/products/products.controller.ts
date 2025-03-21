import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Put,
  } from '@nestjs/common';
  import { ProductsService } from './products.service';
  import { CreateProductDto } from './dto/create-product.dto';
  import { UpdateProductDto } from './dto/update-product.dto';
  import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

  @ApiTags('Products')
  @ApiBearerAuth()
  @Controller('products')
  export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Post()
    @ApiOperation({ summary: 'Create a product' })
    create(@Body() dto: CreateProductDto) {
      return this.productsService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'List all products' })
    findAll() {
      return this.productsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a product by ID' })
    findOne(@Param('id') id: string) {
      return this.productsService.findOne(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a product' })
    update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
      return this.productsService.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a product' })
    remove(@Param('id') id: string) {
      return this.productsService.remove(id);
    }
  }
