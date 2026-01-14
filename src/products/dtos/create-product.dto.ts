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
  title: string;

  @IsString()
  @MinLength(5)
  description: string;

  @IsNumber()
  @IsPositive({ message: 'Price must be a positive number' })
  price: number;
}
