import { IsOptional, IsDateString, IsString, IsEnum } from 'class-validator';

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum ArticleSortBy {
  TITLE = 'title',
  DESCRIPTION = 'description',
  PUBLISHED_AT = 'publishedAt',
  CREATED_AT = 'createdAt',
}

export class QueryDto {
  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  skip?: string;

  @IsOptional()
  @IsString()
  authorId?: string;

  @IsOptional()
  @IsDateString()
  publishedAfter?: Date;

  @IsOptional()
  @IsEnum(ArticleSortBy)
  sortBy?: ArticleSortBy;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;
}
