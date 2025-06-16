import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ReviewDto } from './dto/review.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateReviewDto): Promise<ReviewDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const book = await this.prisma.book.findUnique({
      where: { id: dto.bookId },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    return this.prisma.review.create({
      data: {
        bookId: dto.bookId,
        userId,
        rating: dto.rating,
        comment: dto.comment,
      },
    });
  }

  async getById(id: string): Promise<ReviewDto> {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async getByUserId(
    userId: string,
    pagination?: PaginationDto,
  ): Promise<{ data: ReviewDto[]; total: number }> {
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: pagination?.skip,
        take: pagination?.limit,
      }),
      this.prisma.review.count({
        where: { userId },
      }),
    ]);

    return { data: reviews, total };
  }

  async getByBookId(
    bookId: string,
    pagination?: PaginationDto,
  ): Promise<{ data: ReviewDto[]; total: number }> {
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { bookId },
        include: {
          user: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination?.skip,
        take: pagination?.limit,
      }),
      this.prisma.review.count({
        where: { bookId },
      }),
    ]);

    return { data: reviews, total };
  }

  async update(id: string, dto: UpdateReviewDto): Promise<ReviewDto> {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return this.prisma.review.update({
      where: { id },
      data: {
        rating: dto.rating ?? review.rating,
        comment: dto.comment ?? review.comment,
      },
    });
  }

  async delete(id: string): Promise<ReviewDto> {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return this.prisma.review.delete({
      where: { id },
    });
  }
}