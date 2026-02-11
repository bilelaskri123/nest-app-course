import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { Review } from './review.entity';
import { ReviewsService } from './reviews.service';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import { CreateReviewDto } from './dtos/create-review.dto';
import { NotFoundException } from '@nestjs/common';
type ReviewTestType = {
  id: number;
  comment: string;
  rating: number;
  user: { id: number };
};
type QueryOptions = {
  skip: number;
  take: number;
  order: { createdAt: string };
};

describe('ReviewsService', () => {
  let reviewsService: ReviewsService;
  let reviewsRepository: Repository<Review>;
  const REPOSITORY_TOKEN = getRepositoryToken(Review);
  const createReviewDto: CreateReviewDto = {
    rating: 4,
    comment: 'very good product',
  };

  let reviews: ReviewTestType[];

  beforeEach(async () => {
    reviews = [
      {
        id: 1,
        rating: 4,
        comment: 'very good',
        user: {
          id: 1,
        },
      },
      {
        id: 2,
        rating: 5,
        comment: 'excellent',
        user: {
          id: 2,
        },
      },
      {
        id: 3,
        rating: 3,
        comment: 'acceptable',
        user: {
          id: 3,
        },
      },
      {
        id: 4,
        rating: 2,
        comment: 'not enough',
        user: {
          id: 1,
        },
      },
    ];
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn((userId: number) =>
              Promise.resolve({ id: userId }),
            ),
          },
        },
        {
          provide: ProductsService,
          useValue: {
            findById: jest.fn((productId: number) => {
              Promise.resolve({ id: productId });
            }),
          },
        },
        {
          provide: REPOSITORY_TOKEN,
          useValue: {
            create: jest.fn((dto: CreateReviewDto) => dto),
            save: jest.fn((dto: CreateReviewDto) =>
              Promise.resolve({ ...dto, id: 1, product: { id: 1 } }),
            ),
            find: jest.fn((query: QueryOptions) => {
              reviews = reviews.slice(query.skip, query.skip + query.take);
              return Promise.resolve(reviews);
            }),
            findOneBy: jest.fn((where: { id: number }) => {
              const review = reviews.find((review) => review.id === where.id);
              return Promise.resolve(review);
            }),
            delete: jest.fn((id: number) => {
              return Promise.resolve({ raw: 0, affected: 1 });
            }),
          },
        },
      ],
    }).compile();

    reviewsService = module.get<ReviewsService>(ReviewsService);
    reviewsRepository = module.get<Repository<Review>>(REPOSITORY_TOKEN);
  });

  it('should product service be defined', () => {
    expect(reviewsService).toBeDefined();
  });

  it('should product repository be defined', () => {
    expect(reviewsRepository).toBeDefined();
  });

  // CREATE REVIEW
  describe('CreateReview()', () => {
    it('should call create method in review repository', async () => {
      await reviewsService.createReview(1, 1, createReviewDto);
      expect(reviewsRepository.create).toHaveBeenCalled();
      expect(reviewsRepository.create).toHaveBeenCalledTimes(1);
    });

    it("should call 'save' method in product repository", async () => {
      await reviewsService.createReview(1, 1, createReviewDto);
      expect(reviewsRepository.save).toHaveBeenCalled();
      expect(reviewsRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should create a new product', async () => {
      const result = await reviewsService.createReview(1, 1, createReviewDto);
      expect(result).toBeDefined();
      expect(result.rating).toBe(4);
      expect(result.comment).toBe('very good product');
      expect(result.id).toBe(1);
    });
  });

  // GET ALL REVIEWS
  describe('getAll()', () => {
    it("should call 'find' method in product repository", async () => {
      await reviewsService.getAll();
      expect(reviewsRepository.find).toHaveBeenCalled();
      expect(reviewsRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should return 2 products if an argument passed', async () => {
      const data = await reviewsService.getAll({ limit: 2, page: 1 });
      expect(data).toHaveLength(2);
    });

    it('should return 4 products if no argument passed', async () => {
      const data = await reviewsService.getAll();
      expect(data).toHaveLength(4);
    });
  });

  // GET REVIEW BY ID
  describe('findById()', () => {
    it("should call 'findOneBy' method in product repository", async () => {
      await reviewsService.findById(1);
      expect(reviewsRepository.findOneBy).toHaveBeenCalled();
      expect(reviewsRepository.findOneBy).toHaveBeenCalledTimes(1);
    });

    it('should return review by id', async () => {
      const data = await reviewsService.findById(1);
      expect(data).toMatchObject({ id: 1, rating: 4, comment: 'very good' });
    });

    it('should throw an error if review does not exist', async () => {
      expect.assertions(1);
      try {
        const review = await reviewsService.findById(5);
      } catch (error) {
        expect(error).toMatchObject({ message: 'Review not found' });
      }
    });
  });

  // UPDATE REVIEW
  describe('updateReview()', () => {
    const rating: number = 4.5;
    it('should call save method in review repository and update the review', async () => {
      const result = await reviewsService.updateReview(1, 1, { rating });
      expect(reviewsRepository.save).toHaveBeenCalled();
      expect(reviewsRepository.save).toHaveBeenCalledTimes(1);
      expect(result.rating).toBe(rating);
    });

    it('should throw UnauthorizedException if review.user different to userId', async () => {
      expect.assertions(1);
      try {
        const review = await reviewsService.updateReview(1, 2, { rating });
      } catch (error) {
        expect(error).toMatchObject({
          message: 'You are not authorized to update this review',
        });
      }
    });

    it('should throw NotFoundException if review was not found', async () => {
      expect.assertions(1);
      try {
        const review = await reviewsService.updateReview(10, 1, { rating });
      } catch (error) {
        expect(error).toMatchObject({ message: 'Review not found' });
      }
    });
  });

  // DELETE REVIEW
  describe('deleteReview()', () => {
    const payload = { id: 1, userType: 'ADMIN' };
    it('should call delete method in review repository', async () => {
      await reviewsService.deleteReview(1, payload);
      expect(reviewsRepository.delete).toHaveBeenCalled();
      expect(reviewsRepository.delete).toHaveBeenCalledTimes(1);
      expect(reviewsRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw UnauthorizedException if review.user different to userId', async () => {
      payload.userType = 'USER';
      expect.assertions(1);
      try {
        const review = await reviewsService.deleteReview(2, payload);
      } catch (error) {
        expect(error).toMatchObject({
          message: 'You are not authorized to delete this review',
        });
      }
    });

    it('should throw NotFoundException if review was not found', async () => {
      expect.assertions(1);
      try {
        const review = await reviewsService.deleteReview(10, payload);
      } catch (error) {
        expect(error).toMatchObject({ message: 'Review not found' });
      }
    });
  });
});
