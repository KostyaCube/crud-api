import { Test, TestingModule } from '@nestjs/testing';
import { ArticleController, AuthRequest } from './article.controller';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { PaginatedResponseDto } from './dto/paginated-response.dto';
import { Article } from './entities/article.entity';
import { QueryDto } from './dto/query.dto';
import { User } from '../auth/entities/user.entity';
import { validate } from 'class-validator';
import { UnauthorizedException } from '@nestjs/common';

describe('ArticleController', () => {
  let articleController: ArticleController;
  let articleService: ArticleService;

  const mockArticleService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockRequest: Partial<AuthRequest> = {
    user: {
      id: 1,
      email: 'string',
      name: 'string',
    },
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [ArticleController],
      providers: [{ provide: ArticleService, useValue: mockArticleService }],
    }).compile();

    articleController = moduleRef.get<ArticleController>(ArticleController);
    articleService = moduleRef.get<ArticleService>(ArticleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(articleController).toBeDefined();
  });

  describe('creation', () => {
    it('should call articleService.create and return the created article', async () => {
      const createArticleDto: CreateArticleDto = {
        title: 'New Article',
        description: 'Description for test new article',
        publishedAt: '2024-11-01',
      };

      const result = { id: 1, ...createArticleDto }; // Пример того, что может вернуться из create
      mockArticleService.create.mockResolvedValue(result);

      const response = await articleController.create(createArticleDto, mockRequest as any);

      expect(articleService.create).toHaveBeenCalledWith(createArticleDto, 1); // Параметры функции
      expect(response).toEqual(result);
    });
  });

  it('should block create if user is unauthorized', async () => {
    const createArticleDto: CreateArticleDto = {
      title: 'New Article',
      description:
        'Some content with long description lorem ipsum dolor sit amet consectetur adipiscing elit lorem ipsum dolor sit amet consectetur adipiscing elit',
      publishedAt: '10-10-2024',
    };

    // Попробуем вызвать create с неавторизованным запросом
    try {
      await articleController.create(createArticleDto, {} as any); // {} имитирует неавторизованный запрос
    } catch (e) {
      expect(e).toBeInstanceOf(UnauthorizedException);
      expect(e.response.message).toBe('User is not authorized');
    }
  });

  describe('findAll', () => {
    it('should call articleService.findAll and return a paginated response', async () => {
      const query: QueryDto = { limit: '10', skip: '0' };
      const result: PaginatedResponseDto<Article> = { data: [], total: 0 }; // Пример результата

      mockArticleService.findAll.mockResolvedValue(result);

      const response = await articleController.findAll(query);

      expect(articleService.findAll).toHaveBeenCalledWith(query);
      expect(response).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should call articleService.findOne and return an article', async () => {
      const articleId = 1;
      const result: Article = {
        id: articleId,
        title: 'Article 1',
        description: 'Content',
        publishedAt: new Date(),
        author: new User(),
      };

      mockArticleService.findOne.mockResolvedValue(result);

      const response = await articleController.findOne(articleId);

      expect(articleService.findOne).toHaveBeenCalledWith(articleId);
      expect(response).toEqual(result);
    });
  });

  // тест валидации полей с помощью валидатора
  describe('CreateArticleDto', () => {
    it('should throw error if title is missing', async () => {
      const dto = new CreateArticleDto();
      dto.title = ''; // Пустой title

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0); // Ошибки должны быть
    });

    it('should throw error if description is too short', async () => {
      const dto = new CreateArticleDto();
      dto.title = 'Valid Title';
      dto.description = 'short description'; // Описание слишком короткое
      dto.publishedAt = '2024-11-01';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0); // Ошибки должны быть
    });

    it('should pass validation if all fields are correct', async () => {
      const dto = new CreateArticleDto();
      dto.title = 'Valid Title';
      dto.description =
        'Some content with long description lorem ipsum dolor sit amet consectetur adipiscing elit lorem ipsum dolor sit amet consectetur adipiscing elit';
      dto.publishedAt = '2024-11-01';

      const errors = await validate(dto);
      expect(errors.length).toBe(0); // Ошибок нет
    });
  });
});
