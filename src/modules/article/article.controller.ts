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
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { AuthGuard } from '@nestjs/passport';
import { TokenPayload } from 'src/strategies/jwt.strategy';
import { Article } from './entities/article.entity';
import { PaginatedResponseDto } from './dto/paginated-response.dto';

interface AuthRequest extends Request {
  user: TokenPayload;
}

@Controller('articles')
export class ArticleController {
  constructor(private articleService: ArticleService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() dto: CreateArticleDto, @Req() req: AuthRequest): Promise<Article> {
    return this.articleService.create(dto, +req.user.id);
  }

  @Get()
  async findAll(@Query() query: any): Promise<PaginatedResponseDto<Article>> {
    return await this.articleService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Article> {
    return this.articleService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateArticleDto): Promise<Article> {
    return this.articleService.update(id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.articleService.remove(id);
  }
}
