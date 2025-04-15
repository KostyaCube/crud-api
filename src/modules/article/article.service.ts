import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Article } from './entities/article.entity';
import { PaginatedResponseDto } from './dto/paginated-response.dto';

@Injectable()
export class ArticleService {
  constructor(@InjectRepository(Article) private articleRepository: Repository<Article>) {}

  async create(dto: CreateArticleDto, userId: number): Promise<Article> {
    const article = this.articleRepository.create({
      ...dto,
      author: { id: userId } as User,
    });
    return this.articleRepository.save(article);
  }

  async findAll(query: any): Promise<PaginatedResponseDto<Article>> {
    const take = Number(query.limit) || 10;
    const skip = Number(query.skip) || 0;

    const qb = this.articleRepository
      .createQueryBuilder('article')
      .leftJoin('article.author', 'author')
      .addSelect(['author.id', 'author.firstName', 'author.lastName'])
      .orderBy('article.publishedAt', 'DESC')
      .skip(skip)
      .take(take);

    if (query.authorId) {
      qb.andWhere('author.id = :authorId', { authorId: query.authorId });
    }

    if (query.publishedAfter) {
      qb.andWhere('article.publishedAt >= :publishedAfter', {
        publishedAfter: query.publishedAfter,
      });
    }

    const [data, total] = await qb.getManyAndCount();

    return { data, total };
  }

  async findOne(id: number): Promise<Article> {
    const article = await this.articleRepository
      .createQueryBuilder('article')
      .leftJoin('article.author', 'author')
      .addSelect(['author.id', 'author.firstName', 'author.lastName'])
      .where('article.id = :id', { id })
      .getOne();

    if (!article) {
      throw new HttpException(`Article with ID ${id} not found.`, HttpStatus.NOT_FOUND);
    }
    return article;
  }

  async update(id: number, dto: UpdateArticleDto): Promise<Article> {
    const result = await this.articleRepository.update(id, dto);

    if (result.affected === 0) {
      throw new NotFoundException(`Article with id ${id} not found`);
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.articleRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Article with id ${id} not found`);
    }
  }
}
