import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from './product.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly usersService: UsersService,
  ) {}

  async create(dto: CreateProductDto, userId: number) {
    const user = await this.usersService.findOneBy(userId);
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

  async findAll(): Promise<Product[]> {
    return await this.productRepository.find();
  }

  async findById(id: number): Promise<Product | null> {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async updateById(id: number, dto: UpdateProductDto) {
    return await this.productRepository.update(id, {
      title: dto.title,
      description: dto.description,
      price: dto.price,
    });
  }

  async deleteById(id: number): Promise<void> {
    await this.productRepository.delete(id);
  }
}
