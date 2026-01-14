import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
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
}
