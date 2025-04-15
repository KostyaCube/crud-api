import { IsOptional, IsInt, IsDateString, IsString, IsEnum } from 'class-validator';

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class QueryDto {
  @IsOptional()
  @IsInt()
  limit?: string;

  @IsOptional()
  @IsInt()
  skip?: string;

  @IsOptional()
  @IsInt()
  authorId?: string;

  @IsOptional()
  @IsDateString()
  publishedAfter?: string;

  @IsOptional()
  @IsString()
  @IsEnum(SortOrder)
  sortBy?: string;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;
}
