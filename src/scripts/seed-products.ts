import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { CreateProductDto } from '../products/dtos/create-product.dto';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const productService = app.get(ProductsService);
  const usersService = app.get(UsersService);

  // Get an existing user to associate with the products
  const user = await usersService.findOneBy(3);

  if (!user) {
    console.error('User with ID 3 not found. Please create the user first.');
    await app.close();
    return;
  }

  console.log('Seeding products...');

  for (let i = 1; i <= 100; i++) {
    const productData: CreateProductDto = {
      title: `Product ${i}`,
      description: `Description for product ${i}`,
      price: Math.floor(Math.random() * 500) + 10,
    };
    await productService.create(productData, user.id);
    console.log(`Created: ${productData.title}`);
  }
  console.log('Seeding completed.');
  await app.close();
}

seed().catch((error) => {
  console.error('Error during seeding:', error);
  process.exit(1);
});
