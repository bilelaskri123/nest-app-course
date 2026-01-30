import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'title of the product', default: '' })
  title: string;

  @IsString()
  @MinLength(5)
  @ApiProperty({ description: 'description of the product', default: '' })
  description: string;

  @IsNumber()
  @IsPositive({ message: 'Price must be a positive number' })
  @ApiProperty({ description: 'price of the product', default: 0 })
  price: number;
}
