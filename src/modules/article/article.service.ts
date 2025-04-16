import { HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Article } from './entities/article.entity';
import { PaginatedResponseDto } from './dto/paginated-response.dto';
import { QueryDto, SortOrder } from './dto/query.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(dto: CreateArticleDto, userId: number): Promise<Article> {
    const article = this.articleRepository.create({
      ...dto,
      author: { id: userId } as User,
    });
    await this.invalidateArticleCache();
    return this.articleRepository.save(article);
  }

  async findAll(query: QueryDto): Promise<PaginatedResponseDto<Article>> {
    const take = Number(query.limit) || 10;
    const skip = Number(query.skip) || 0;
    const sortBy = query.sortBy || 'publishedAt';
    const sortOrder = query.sortOrder || SortOrder.DESC;

    const key = `articles-${sortBy}:${sortOrder}:${take}:${skip}:${query.authorId || ''}:${query.publishedAfter || ''}`;
    const cachedArticles = await this.cacheManager.get<PaginatedResponseDto<Article>>(key);

    if (cachedArticles) return cachedArticles;
    const qb = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .addSelect(['author.id', 'author.firstName', 'author.lastName'])
      .orderBy(`article.${sortBy}`, sortOrder)
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

    const result = { data, total };
    await this.cacheManager.set(key, result, 10000);
    await this.addArticleCacheKey(key);

    return result;
  }

  async findOne(id: number): Promise<Article> {
    const key = `article-${id}`;

    const cachedArticle = await this.cacheManager.get<Article>(key);
    if (cachedArticle) return cachedArticle;

    const article = await this.articleRepository
      .createQueryBuilder('article')
      .leftJoin('article.author', 'author')
      .addSelect(['author.id', 'author.firstName', 'author.lastName'])
      .where('article.id = :id', { id })
      .getOne();

    if (!article) {
      throw new HttpException(`Article with ID ${id} not found.`, HttpStatus.NOT_FOUND);
    }

    await this.cacheManager.set(key, article, 10000);
    return article;
  }

  async update(id: number, dto: UpdateArticleDto): Promise<Article> {
    const result = await this.articleRepository.update(id, dto);

    if (result.affected === 0) {
      throw new NotFoundException(`Article with id ${id} not found`);
    }
    await this.cacheManager.del(`article-${id}`);
    await this.invalidateArticleCache();
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.articleRepository.delete(id);
    await this.cacheManager.del(`article-${id}`);
    await this.invalidateArticleCache();

    if (result.affected === 0) {
      throw new NotFoundException(`Article with id ${id} not found`);
    }
  }

  private async addArticleCacheKey(key: string) {
    const keys = (await this.cacheManager.get<string[]>('cache:articles:keys')) || [];
    if (!keys.includes(key)) {
      keys.push(key);
      await this.cacheManager.set('cache:articles:keys', keys, 3600000); // на 1 час
    }
  }

  async invalidateArticleCache() {
    const keys = await this.cacheManager.get<string[]>('cache:articles:keys');
    if (keys?.length) {
      await Promise.all(keys.map((k) => this.cacheManager.del(k)));
    }
    await this.cacheManager.del('cache:articles:keys');
  }
}
