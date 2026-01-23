import { Type } from 'class-transformer';
import { IsOptional, Min, Validate } from 'class-validator';
import { MinLessThanMaxValidator } from '../../utils/validators/min-less-than-max.validator';

export class QueryProductDto {
  @IsOptional()
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
}
