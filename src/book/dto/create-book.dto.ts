import { IsString, IsOptional, IsBoolean, IsDateString, IsArray, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  price: number;

  @IsString()
  isbn: string;

  @IsOptional()
  @IsBoolean()
  digital?: boolean;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @IsOptional()
  @IsString()
  publisher?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];

  @IsOptional()
  @IsString()
  coverUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  coverImage?: Express.Multer.File;

  @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' }, required: false })
  additionalImages?: Express.Multer.File[];
}