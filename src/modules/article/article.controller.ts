import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
  Req,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { AuthGuard } from '@nestjs/passport';
import { TokenPayload } from 'src/strategies/jwt.strategy';
import { Article } from './entities/article.entity';
import { PaginatedResponseDto } from './dto/paginated-response.dto';
import { QueryDto } from './dto/query.dto';
import {
  ApiTags,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import {
  INTERNAL_SERVER_ERROR,
  CREATED_RES,
  UNAUTHORIZED_RES,
  VALIDATION_FAILS,
  FIND_ALL_PAGINATED_RES,
  FIND_ONE_RES,
  DELETE_ONE_RES,
  UPDATE_ONE_RES,
} from 'src/constants/api-messages';

export interface AuthRequest extends Request {
  user: TokenPayload;
}

@ApiTags('Articles')
@Controller('article')
export class ArticleController {
  constructor(private articleService: ArticleService) {}

  // создание новой статьи и описание разных ответов сервера
  @UseGuards(AuthGuard('jwt')) // защита роута. В более крупном приложении лучше закрыть все роуты и сделать кастомный декоратор Public, который будет открывать нужные роуты
  @Post()
  @ApiCreatedResponse({ description: CREATED_RES })
  @ApiUnauthorizedResponse({ description: UNAUTHORIZED_RES })
  @ApiBadRequestResponse({ description: VALIDATION_FAILS })
  @ApiInternalServerErrorResponse({ description: INTERNAL_SERVER_ERROR })
  create(@Body() dto: CreateArticleDto, @Req() req: AuthRequest): Promise<Article> {
    if (!req.user) {
      throw new UnauthorizedException('User is not authorized');
    }
    return this.articleService.create(dto, +req.user.id);
  }

  // поиск статей по разным парметрам, описанным в QueryDTO
  @Get()
  @ApiOkResponse({
    description: FIND_ALL_PAGINATED_RES,
    type: PaginatedResponseDto,
  })
  @ApiInternalServerErrorResponse({ description: INTERNAL_SERVER_ERROR })
  async findAll(@Query() query: QueryDto): Promise<PaginatedResponseDto<Article>> {
    return await this.articleService.findAll(query);
  }

  @Get(':id')
  @ApiOkResponse({ description: FIND_ONE_RES, type: Article })
  @ApiInternalServerErrorResponse({ description: INTERNAL_SERVER_ERROR })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Article> {
    return this.articleService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  @ApiOkResponse({ description: UPDATE_ONE_RES, type: Article })
  @ApiUnauthorizedResponse({ description: UNAUTHORIZED_RES })
  @ApiInternalServerErrorResponse({ description: INTERNAL_SERVER_ERROR })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateArticleDto): Promise<Article> {
    return this.articleService.update(id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @ApiUnauthorizedResponse({ description: UNAUTHORIZED_RES })
  @ApiOkResponse({ description: DELETE_ONE_RES })
  @ApiInternalServerErrorResponse({ description: INTERNAL_SERVER_ERROR })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.articleService.remove(id);
  }
}
