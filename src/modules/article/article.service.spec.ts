import { Test, TestingModule } from '@nestjs/testing';
import { ArticleService } from './article.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { NotFoundException } from '@nestjs/common';

const mockQueryBuilder = {
  leftJoin: jest.fn().mockReturnThis(),
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  addSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn(),
  getOne: jest.fn(),
};

const mockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(() => mockQueryBuilder),
});

const mockCache = () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
});

describe('ArticleService', () => {
  let articleService: ArticleService;
  let repo: jest.Mocked<Repository<Article>>;
  let cache: jest.Mocked<Cache>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleService,
        { provide: getRepositoryToken(Article), useFactory: mockRepository },
        { provide: CACHE_MANAGER, useFactory: mockCache },
      ],
    }).compile();

    articleService = module.get<ArticleService>(ArticleService);
    repo = module.get(getRepositoryToken(Article));
    cache = module.get(CACHE_MANAGER);
  });

  describe('findOne', () => {
    it('should return cached article if present', async () => {
      const article = { id: 1, title: 'Test' } as Article;
      cache.get.mockResolvedValue(article);

      const result = await articleService.findOne(1);

      expect(cache.get).toHaveBeenCalledWith('article-1');
      expect(result).toEqual(article);
    });

    it('should throw NotFound if not found', async () => {
      cache.get.mockResolvedValue(null);
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await expect(articleService.findOne(1)).rejects.toThrow('Article with ID 1 not found.');
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if article does not exist', async () => {
      repo.delete.mockResolvedValue({ affected: 0, raw: {} });

      await expect(articleService.remove(123)).rejects.toThrow(NotFoundException);
    });

    it('should delete article and clear cache', async () => {
      repo.delete.mockResolvedValue({ affected: 1, raw: {} });

      await articleService.remove(1);

      expect(repo.delete).toHaveBeenCalledWith(1);
      expect(cache.del).toHaveBeenCalledWith('article-1');
    });
  });
});
