import { User } from 'src/modules/auth/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity()
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'timestamp' })
  publishedAt: Date;

  @ManyToOne(() => User, (user) => user.articles, { eager: true })
  author: User;
}
