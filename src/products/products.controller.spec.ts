import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { JWTPayloadType } from '../utils/types';
import { UserType } from '../utils/enums';
import { CreateProductDto } from './dtos/create-product.dto';
import { title } from 'process';
import { NotFoundException } from '@nestjs/common';
import { UpdateProductDto } from './dtos/update-product.dto';
type ProductTestType = { id: number; title: string; price: number };
type ProductQueryType = {
  title?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
};

describe('ProductsController', () => {
  let productsController: ProductsController;
  let productsService: ProductsService;
  const currentUser: JWTPayloadType = { id: 1, userType: UserType.ADMIN };
  const createProductDto: CreateProductDto = {
    title: 'book',
    description: 'about this book',
    price: 10,
  };

  let products: ProductTestType[];
  beforeEach(async () => {
    products = [
      { id: 1, title: 'book', price: 10 },
      { id: 2, title: 'pen', price: 10 },
      { id: 3, title: 'laptop', price: 500 },
      { id: 4, title: 'screen', price: 300 },
    ];
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
            findAll: jest.fn((query?: ProductQueryType) => {
              let page: number = 1;
              let limit: number = 10;
              if (query?.page && query?.limit) {
                page = query?.page;
                limit = query?.limit;
              }

              if (query?.title) {
                products = products.filter((p) => p.title === query.title);
              }
              if (
                query?.minPrice !== undefined &&
                query?.maxPrice !== undefined
              ) {
                products = products.filter(
                  (p) =>
                    p.price >= query.minPrice! && p.price <= query.maxPrice!,
                );
              }

              products = products.slice((page - 1) * limit, page * limit);
              return Promise.resolve(products);
            }),

            findById: jest.fn((id: number) => {
              const product = products.find((p) => p.id === id);
              if (!product) {
                throw new NotFoundException('Product not found');
              }
              return Promise.resolve(product);
            }),
            updateById: jest.fn((productId: number, dto: UpdateProductDto) =>
              Promise.resolve({ ...dto, id: productId }),
            ),
            deleteById: jest.fn((productId: number) => true),
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

  // Get All products
  describe('Get All products', () => {
    it('should call findAll method in productsService', async () => {
      await productsController.getAllProducts();
      expect(productsService.findAll).toHaveBeenCalled();
      expect(productsService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return all products if no argument passed', async () => {
      const data = await productsController.getAllProducts();
      expect(data).toBe(products);
      expect(data).toHaveLength(4);
    });

    it('should return products based on title', async () => {
      const data = await productsController.getAllProducts({ title: 'book' });
      expect(data[0]).toMatchObject({ title: 'book' });
      expect(data).toHaveLength(1);
    });

    it('should return all products based on minPrice & maxPrice', async () => {
      const data = await productsController.getAllProducts({
        minPrice: 250,
        maxPrice: 500,
      });
      expect(data[0]).toMatchObject({ title: 'laptop' });
      expect(data).toHaveLength(2);
    });
  });

  // Get product by id
  describe('getProductById()', () => {
    it('should call findById method in productsService', async () => {
      await productsController.getProductById(2);
      expect(productsService.findById).toHaveBeenCalled();
      expect(productsService.findById).toHaveBeenCalledTimes(1);
      expect(productsService.findById).toHaveBeenCalledWith(2);
    });

    it('should return a product with the given id', async () => {
      const product = await productsController.getProductById(2);
      expect(product.id).toBe(2);
    });

    it('should throw notFoundException if product was not found', async () => {
      expect.assertions(1);
      try {
        await productsController.getProductById(20);
      } catch (error) {
        expect(error).toMatchObject({ message: 'Product not found' });
      }
    });
  });

  // Update Product
  describe('Update product', () => {
    const title = 'product updated';
    it('should call update method in productsService', async () => {
      await productsController.updateProduct(2, { title });
      expect(productsService.updateById).toHaveBeenCalled();
      expect(productsService.updateById).toHaveBeenCalledTimes(1);
      expect(productsService.updateById).toHaveBeenCalledWith(2, { title });
    });

    it('should return the updated product', async () => {
      const result = await productsController.updateProduct(2, { title });
      expect(result.title).toBe(title);
      expect(result.id).toBe(2);
    });
  });

  // Delete Product
  describe('Delete product', () => {
    it('should call deleteById in productsService', async () => {
      await productsController.deleteProduct(2);
      expect(productsService.deleteById).toHaveBeenCalled();
      expect(productsService.deleteById).toHaveBeenCalledTimes(1);
    })
    
  });
});
