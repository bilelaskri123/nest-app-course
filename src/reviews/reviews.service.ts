import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './review.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import { CreateReviewDto } from './dtos/create-review.dto';
import { JWTPayloadType } from '../utils/types';
import { QueryPaginationDto } from './dtos/query-pagination.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
  ) {}

  async createReview(
    userId: number,
    productId: number,
    createReviewDto: CreateReviewDto,
  ) {
    const user = await this.usersService.findById(userId);
    const product = await this.productsService.findById(productId);
    const review = this.reviewRepository.create({
      user,
      product,
      ...createReviewDto,
    });

    const savedReview = await this.reviewRepository.save(review);
    return {
      id: savedReview.id,
      rating: savedReview.rating,
      comment: savedReview.comment,
      createdAt: savedReview.createdAt,
      updatedAt: savedReview.updatedAt,
      userId: savedReview.user.id,
      productId: savedReview.product.id,
    };
  }

  async findById(id: number): Promise<Review> {
    const review = await this.reviewRepository.findOneBy({ id });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    return review;
  }

  /**
   * Get all reviews with pagination
   * @param query QueryPaginationDto (limit and page attributes)
   * @returns collection of reviews
   */
  async getAll(query: QueryPaginationDto): Promise<Review[]> {
    const { page = 1, limit = 10 } = query;
    return await this.reviewRepository.find({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async updateReview(id: number, userId: number, updateReviewDto: any) {
    const review = await this.findById(id);
    if (review.user.id !== userId) {
      throw new NotFoundException(
        'You are not authorized to update this review',
      );
    }
    review.rating = updateReviewDto.rating ?? review.rating;
    review.comment = updateReviewDto.comment ?? review.comment;
    return await this.reviewRepository.save(review);
  }

  async deleteReview(
    id: number,
    payload: JWTPayloadType,
  ): Promise<{ message: string }> {
    const review = await this.findById(id);
    if (review.user.id !== payload.id && payload.userType !== 'ADMIN') {
      throw new NotFoundException(
        'You are not authorized to delete this review',
      );
    }
    await this.reviewRepository.delete(id);
    return { message: 'Review deleted successfully' };
  }
}
