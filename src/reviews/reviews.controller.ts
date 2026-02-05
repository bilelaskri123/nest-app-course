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
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { Roles } from '../users/decorators/user-role.decorator';
import { UserType } from '../utils/enums';
import { AuthRoleGuard } from '../users/guards/auth-role.guard';
import { UpdateReviewDto } from './dtos/update-review.dto';
import type { JWTPayloadType } from '../utils/types';
import { QueryPaginationDto } from './dtos/query-pagination.dto';
import { ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';

@Controller('/api/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post(':productId')
  @Roles(UserType.ADMIN, UserType.NORMAL_USER)
  @UseGuards(AuthRoleGuard)
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  @ApiOperation({ summary: 'Create product review' })
  @ApiSecurity('bearer')
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
  @ApiResponse({ status: 200, description: 'Reviews fetched successfully' })
  @ApiOperation({ summary: 'Get reviews list' })
  @ApiSecurity('bearer')
  public async getAllReviews(@Query() query: QueryPaginationDto) {
    return await this.reviewsService.getAll(query);
  }

  @Put(':id')
  @Roles(UserType.ADMIN, UserType.NORMAL_USER)
  @UseGuards(AuthRoleGuard)
  @ApiResponse({ status: 200, description: 'Review updated successfully' })
  @ApiOperation({ summary: 'Update Review' })
  @ApiSecurity('bearer')
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
  @ApiResponse({ status: 201, description: 'Review deleted successfully' })
  @ApiOperation({ summary: 'Delete Review' })
  @ApiSecurity('bearer')
  public async deleteReview(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return await this.reviewsService.deleteReview(id, payload);
  }
}
