import { Review } from '../reviews/review.entity';
import { User } from '../users/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  title: string;

  @Column('decimal')
  price: number;
  @Column()
  description: string;

  @CreateDateColumn({})
  createdAt: Date;
  @UpdateDateColumn({})
  updatedAt: Date;

  // Relations
  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];

  @ManyToOne(() => User, (user) => user.products)
  user: User;
}
