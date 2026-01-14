import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from './product.entity';
import { Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProductDto } from './dtos/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const newProduct = this.productRepository.create({
      title: dto.title,
      description: dto.description,
      price: dto.price,
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

  async updateById(id: number, dto: Partial<CreateProductDto>) {
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
