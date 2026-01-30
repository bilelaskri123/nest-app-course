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
import { QueryPaginationDto } from 'src/reviews/dtos/query-pagination.dto';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
} from '@nestjs/swagger';

@Controller('/api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRoleGuard)
  @ApiResponse({ status: 200, description: 'product created successfully' })
  @ApiOperation({ summary: 'Create new Product' })
  @ApiSecurity('bearer')
  async createProduct(
    @Body() body: CreateProductDto,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return await this.productsService.create(body, payload.id);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'products fetched successfully' })
  @ApiOperation({ summary: 'Get a collection of products' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of products per page',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'The page number',
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    description: 'Max price filter',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    description: 'Min price filter',
  })
  @ApiQuery({
    name: 'title',
    required: false,
    description: 'Filter products by title',
  })
  getAllProducts(@Query() query: QueryProductDto) {
    return this.productsService.findAll(query);
  }

  @Get('/:id')
  @ApiResponse({ status: 200, description: 'product fetched successfully' })
  @ApiOperation({ summary: 'Get Single Product' })
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
  @ApiResponse({ status: 200, description: 'product updated successfully' })
  @ApiOperation({ summary: 'Update Product' })
  @ApiSecurity('bearer')
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
  @ApiResponse({ status: 200, description: 'product deleted successfully' })
  @ApiOperation({ summary: 'Delete Product' })
  @ApiSecurity('bearer')
  deleteProduct(@Param('id') id: string) {
    return this.productsService.deleteById(+id);
  }
}
