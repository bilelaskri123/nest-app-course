import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { CreateProductDto } from './dtos/create-product.dto';
import { ProductsService } from './products.service';

@Controller('/api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async createProduct(@Body() body: CreateProductDto) {
    return await this.productsService.create(body);
  }

  @Get()
  getAllProducts() {
    return this.productsService.findAll();
  }

  @Get('/:id')
  getProductById(
    @Param(
      'id',
      new ParseIntPipe({
        exceptionFactory: () => new BadRequestException('Invalid product ID'),
      }),
    )
    id: number,
  ) {
    return this.productsService.findById(id);
  }

  @Put('/:id')
  updateProduct(
    @Param(
      'id',
      new ParseIntPipe({
        exceptionFactory: () => new BadRequestException('Invalid product ID'),
      }),
    )
    id: number,
    @Body() body: Partial<CreateProductDto>,
  ) {
    return this.productsService.updateById(id, body);
  }

  @Delete('/:id')
  deleteProduct(@Param('id') id: string) {
    return this.productsService.deleteById(+id);
  }
}
