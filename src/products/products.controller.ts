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
  UseGuards,
} from '@nestjs/common';
import { CreateProductDto } from './dtos/create-product.dto';
import { ProductsService } from './products.service';
import { UpdateProductDto } from './dtos/update-product.dto';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { AuthRoleGuard } from 'src/users/guards/auth-role.guard';
import { Roles } from 'src/users/decorators/user-role.decorator';
import type { JWTPayloadType } from 'src/utils/types';
import { UserType } from 'src/utils/enums';

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
    console.log(payload);
    return await this.productsService.create(body, payload.id);
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
