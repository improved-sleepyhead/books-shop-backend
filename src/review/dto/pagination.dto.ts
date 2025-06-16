import { IsOptional, IsNumber, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  skip?: number = 0;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}