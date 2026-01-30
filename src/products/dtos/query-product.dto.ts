import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min, Validate } from 'class-validator';
import { MinLessThanMaxValidator } from '../../utils/validators/min-less-than-max.validator';
import { ApiProperty } from '@nestjs/swagger';

export class QueryProductDto {
  @IsOptional()
  @ApiProperty()
  title?: string;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @Validate(MinLessThanMaxValidator)
  maxPrice?: number;

  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit?: number;
}
