import { User } from 'src/modules/auth/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @ManyToOne(() => User, (user) => user.articles, { eager: true })
  author: User;

  @CreateDateColumn()
  publishedAt: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
