import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from './product.entity';
import {
  Between,
  LessThanOrEqual,
  Like,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { UsersService } from '../users/users.service';
import { QueryProductDto } from './dtos/query-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly usersService: UsersService,
  ) {}

  async create(dto: CreateProductDto, userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const newProduct = this.productRepository.create({
      ...dto,
      title: dto.title.toLowerCase(),
      user: user,
    });

    return await this.productRepository.save(newProduct);
  }

  async findAll(query: QueryProductDto): Promise<Product[]> {
    const filters = {};
    if (query.title) {
      Object.assign(filters, {
        title: Like(`%${query.title.toLowerCase()}%`),
      });
    }
    if (query.minPrice && query.maxPrice) {
      Object.assign(filters, {
        price: Between(query.minPrice, query.maxPrice),
      });
    } else if (query.minPrice) {
      Object.assign(filters, {
        price: MoreThanOrEqual(query.minPrice),
      });
    } else if (query.maxPrice) {
      Object.assign(filters, {
        price: LessThanOrEqual(query.maxPrice),
      });
    }

    return await this.productRepository.find({
      where: filters,
    });
  }

  async findById(id: number): Promise<Product> {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async updateById(id: number, dto: UpdateProductDto) {
    const product = await this.findById(id);
    product.title = dto.title?.toLowerCase() ?? product?.title;
    product.description = dto.description ?? product?.description;
    product.price = dto.price ?? product?.price;

    return this.productRepository.save(product);
  }

  async deleteById(id: number): Promise<{ message: string }> {
    const response = await this.productRepository.delete(id);
    if (response.affected && response.affected > 0) {
      return { message: 'Product deleted successfully' };
    }
    throw new NotFoundException('Product not found');
  }
}
