import {
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
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dtos/create-review.dto';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { Roles } from 'src/users/decorators/user-role.decorator';
import { UserType } from 'src/utils/enums';
import { AuthRoleGuard } from 'src/users/guards/auth-role.guard';
import { AuthGuard } from 'src/users/guards/auth.guard';
import { UpdateReviewDto } from './dtos/update-review.dto';
import type { JWTPayloadType } from 'src/utils/types';
import { QueryPaginationDto } from './dtos/query-pagination.dto';

@Controller('/api/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post(':productId')
  @Roles(UserType.ADMIN, UserType.NORMAL_USER)
  @UseGuards(AuthRoleGuard)
  public async createReview(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() body: CreateReviewDto,
    @CurrentUser('id') userId: number,
  ) {
    return await this.reviewsService.createReview(userId, productId, body);
  }

  @Get()
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRoleGuard)
  public async getAllReviews(@Query() query: QueryPaginationDto) {
    return await this.reviewsService.getAll(query);
  }

  // @Get(':id')
  // @UseGuards(AuthGuard)
  // public async getReviewById(@Param('id', ParseIntPipe) id: number) {
  //   return await this.reviewsService.findById(id);
  // }

  @Put(':id')
  @Roles(UserType.ADMIN, UserType.NORMAL_USER)
  @UseGuards(AuthRoleGuard)
  public async updateReview(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
    @Body() body: UpdateReviewDto,
  ) {
    return await this.reviewsService.updateReview(id, userId, body);
  }

  @Delete(':id')
  @Roles(UserType.ADMIN, UserType.NORMAL_USER)
  @UseGuards(AuthRoleGuard)
  public async deleteReview(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return await this.reviewsService.deleteReview(id, payload);
  }
}
