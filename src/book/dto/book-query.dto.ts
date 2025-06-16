import { IsOptional, IsString, IsBoolean, IsNumber } from 'class-validator';

export class BookQueryDto {
  @IsOptional()
  @IsNumber()
  readonly page?: number = 1;

  @IsOptional()
  @IsNumber()
  readonly limit?: number = 10;

  @IsOptional()
  @IsString()
  readonly title?: string;

  @IsOptional()
  @IsString()
  readonly author?: string;

  @IsOptional()
  @IsString()
  readonly isbn?: string;

  @IsOptional()
  @IsBoolean()
  readonly digital?: boolean;

  @IsOptional()
  @IsNumber()
  readonly minPrice?: number;

  @IsOptional()
  @IsNumber()
  readonly maxPrice?: number;

  @IsOptional()
  @IsString()
  readonly userId?: string;

  @IsOptional()
  @IsBoolean()
  readonly isFavorite?: boolean;
}