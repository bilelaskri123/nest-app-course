import { Product } from 'src/products/product.entity';
import { Review } from 'src/reviews/review.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserType } from 'src/utils/enums';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: true })
  username: string;

  @Column({ length: 150, unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserType, default: UserType.NORMAL_USER })
  userType: UserType;

  @Column({ default: false })
  isVerified: boolean;

  @CreateDateColumn({})
  createdAt: Date;

  @UpdateDateColumn({})
  updatedAt: Date;

  // Relations
  @OneToMany(() => Product, (product) => product.user)
  products: Product[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];
}
