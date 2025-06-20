import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { Roles } from 'src/user/decorators/user.decorator';
import { ReviewOwnershipGuard } from './guard/review-ownership.guard';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewDto } from './dto/review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('reviews')
@UseGuards(JwtAuthGuard, ReviewOwnershipGuard)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @Auth()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateReviewDto) {
    return this.reviewService.create(userId, dto);
  }

  @Get(':id')
  @Auth()
  @Roles('CUSTOMERID', 'ADMIN')
  getById(@Param('id') id: string): Promise<ReviewDto> {
    return this.reviewService.getById(id);
  }

  @Get('user/me')
  @Auth()
  getMyReviews(
    @CurrentUser('id') userId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.reviewService.getByUserId(userId, pagination);
  }

  @Get('book/:bookId')
  @Auth()
  getForBook(
    @Param('bookId') bookId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.reviewService.getByBookId(bookId, pagination);
  }

  @Patch(':id')
  @Auth()
  @Roles('CUSTOMERID', 'ADMIN')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateReviewDto,
  ): Promise<ReviewDto> {
    return this.reviewService.update(id, dto);
  }

  @Delete(':id')
  @Auth()
  @Roles('CUSTOMERID', 'ADMIN')
  delete(@Param('id') id: string): Promise<ReviewDto> {
    return this.reviewService.delete(id);
  }
}