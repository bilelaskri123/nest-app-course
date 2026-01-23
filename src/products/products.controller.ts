import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateProductDto } from './dtos/create-product.dto';
import { ProductsService } from './products.service';
import { UpdateProductDto } from './dtos/update-product.dto';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { AuthRoleGuard } from '../users/guards/auth-role.guard';
import { Roles } from '../users/decorators/user-role.decorator';
import type { JWTPayloadType } from '../utils/types';
import { UserType } from '../utils/enums';
import { QueryProductDto } from './dtos/query-product.dto';

@Controller('/api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRoleGuard)
  async createProduct(
    @Body() body: CreateProductDto,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return await this.productsService.create(body, payload.id);
  }

  @Get()
  getAllProducts(@Query() query: QueryProductDto) {
    return this.productsService.findAll(query);
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
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRoleGuard)
  updateProduct(
    @Param(
      'id',
      new ParseIntPipe({
        exceptionFactory: () => new BadRequestException('Invalid product ID'),
      }),
    )
    id: number,
    @Body() body: UpdateProductDto,
  ) {
    return this.productsService.updateById(id, body);
  }

  @Delete('/:id')
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRoleGuard)
  deleteProduct(@Param('id') id: string) {
    return this.productsService.deleteById(+id);
  }
}
