import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { Review } from './review.entity';
import { ReviewsService } from './reviews.service';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import { CreateReviewDto } from './dtos/create-review.dto';
type ReviewTestType = { id: number; comment: string; rating: number };
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
      },
      {
        id: 2,
        rating: 5,
        comment: 'excellent',
      },
      {
        id: 3,
        rating: 3,
        comment: 'acceptable',
      },
      {
        id: 4,
        rating: 2,
        comment: 'not enough',
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
});
