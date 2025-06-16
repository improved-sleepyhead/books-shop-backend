import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { BookDto } from './dto/book.dto';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { BookQueryDto } from './dto/book-query.dto';

@Injectable()
export class BookService {
  constructor(private prisma: PrismaService) {}

  async getAll(query: BookQueryDto): Promise<BookDto[]> {
    const {
      page = 1,
      limit = 10,
      title,
      author,
      isbn,
      digital,
      minPrice,
      maxPrice,
      userId,
      isFavorite,
    } = query;

    const where: any = {};

    if (title) where.title = { contains: title, mode: 'insensitive' };
    if (author) where.author = { contains: author, mode: 'insensitive' };
    if (isbn) where.isbn = { contains: isbn, mode: 'insensitive' };
    if (digital !== undefined) where.digital = digital;
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (isFavorite && userId) {
      where.wishlistItems = {
        some: {
          userId,
          isLiked: true,
        },
      };
    }

    const books = await this.prisma.book.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        wishlistItems: userId ? {
          where: { userId },
          select: { isLiked: true },
        } : false,
      },
    });

    const bookIds = books.map((book) => book.id);

    const ratings = await this.prisma.review.groupBy({
      by: ['bookId'],
      where: { bookId: { in: bookIds } },
      _avg: { rating: true },
    });

    const ratingMap = ratings.reduce((acc, curr) => {
      acc[curr.bookId] = curr._avg.rating;
      return acc;
    }, {} as Record<string, number | null>);

    return books.map((book) => ({
      ...book,
      averageRating: ratingMap[book.id] ?? null,
      isFavorite: userId ? book.wishlistItems?.[0]?.isLiked ?? false : undefined,
    }));
  }

  async getById(id: string, userId?: string): Promise<BookDto> {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: {
        wishlistItems: userId ? {
          where: { userId },
          select: { isLiked: true },
        } : false,
      },
    });

    if (!book) throw new NotFoundException('Book not found');

    const avgRating = await this.prisma.review.aggregate({
      where: { bookId: id },
      _avg: { rating: true },
    });

    return {
      ...book,
      averageRating: avgRating._avg.rating ?? null,
      isFavorite: userId ? book.wishlistItems?.[0]?.isLiked ?? false : undefined,
    };
  }

  async create(dto: CreateBookDto): Promise<BookDto> {
    return this.prisma.book.create({
      data: {
        ...dto,
        price: new Decimal(dto.price),
        digital: dto.digital ?? false,
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : undefined,
        categories: dto.categoryIds?.length
          ? { connect: dto.categoryIds.map((id) => ({ id })) }
          : undefined,
        tags: dto.tagIds?.length
          ? { connect: dto.tagIds.map((id) => ({ id })) }
          : undefined,
        imageUrls: dto.imageUrls ?? [],
      },
    });
  }

  async update(id: string, dto: UpdateBookDto): Promise<BookDto> {
    const book = await this.prisma.book.findUnique({
      where: { id },
    });

    if (!book) throw new NotFoundException('Book not found');

    return this.prisma.book.update({
      where: { id },
      data: {
        ...dto,
        price: dto.price !== undefined ? new Decimal(dto.price) : undefined,
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : undefined,
        categories: dto.categoryIds?.length
          ? { set: dto.categoryIds.map((id) => ({ id })) }
          : undefined,
        tags: dto.tagIds?.length
          ? { set: dto.tagIds.map((id) => ({ id })) }
          : undefined,
        imageUrls: dto.imageUrls !== undefined ? dto.imageUrls : undefined,
      },
    });
  }

  async delete(id: string): Promise<BookDto> {
    const book = await this.prisma.book.findUnique({
      where: { id },
    });

    if (!book) throw new NotFoundException('Book not found');

    return this.prisma.book.delete({
      where: { id },
    });
  }

  async toggleFavorite(userId: string, bookId: string): Promise<boolean> {
    const existingItem = await this.prisma.wishlistItem.findFirst({
      where: { userId, bookId },
    });

    if (existingItem) {
      const updated = await this.prisma.wishlistItem.update({
        where: { id: existingItem.id },
        data: { isLiked: !existingItem.isLiked },
      });
      return updated.isLiked;
    } else {
      await this.prisma.wishlistItem.create({
        data: { userId, bookId, isLiked: true },
      });
      return true;
    }
  }

  async getFavorites(userId: string, query: Omit<BookQueryDto, 'userId' | 'isFavorite'>): Promise<BookDto[]> {
    return this.getAll({
      ...query,
      userId,
      isFavorite: true,
    });
  }
}