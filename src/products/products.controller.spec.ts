import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { JWTPayloadType } from '../utils/types';
import { UserType } from '../utils/enums';
import { CreateProductDto } from './dtos/create-product.dto';

describe('ProductsController', () => {
  let productsController: ProductsController;
  let productsService: ProductsService;
  const currentUser: JWTPayloadType = { id: 1, userType: UserType.ADMIN };
  const createProductDto: CreateProductDto = {
    title: 'book',
    description: 'about this book',
    price: 10,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        { provide: ConfigService, useValue: {} },
        { provide: JwtService, useValue: {} },
        { provide: UsersService, useValue: {} },
        {
          provide: ProductsService,
          useValue: {
            create: jest.fn((dto: CreateProductDto, userId: number) =>
              Promise.resolve({ ...dto, id: 1 }),
            ),
          },
        },
      ],
    }).compile();

    productsController = module.get<ProductsController>(ProductsController);
    productsService = module.get<ProductsService>(ProductsService);
  });

  it('should product controller be defined', () => {
    expect(productsController).toBeDefined();
  });

  it('should product service be defined', () => {
    expect(productsController).toBeDefined();
  });

  // create new Product
  describe('create new Product', () => {
    it('should call create method in product service', async () => {
      await productsController.createProduct(createProductDto, currentUser);
      expect(productsService.create).toHaveBeenCalled();
      expect(productsService.create).toHaveBeenCalledTimes(1);
      expect(productsService.create).toHaveBeenCalledWith(
        createProductDto,
        currentUser.id,
      );
    });

    it('should return new product with the given data', async () => {
      const result = await productsController.createProduct(
        createProductDto,
        currentUser,
      );
      expect(result).toMatchObject(createProductDto);
      expect(result.id).toBe(1);
    });
  });
});
