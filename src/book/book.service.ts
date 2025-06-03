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

    return this.prisma.book.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }


  async getById(id: string): Promise<BookDto> {
    const book = await this.prisma.book.findUnique({
      where: { id },
    });

    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  async create(userId: string, dto: CreateBookDto): Promise<BookDto> {
    const vendor = await this.prisma.vendor.findUnique({
      where: { ownerId: userId },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    return this.prisma.book.create({
      data: {
        ...dto,
        price: new Decimal(dto.price),
        digital: dto.digital ?? false,
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : undefined,
        vendorId: vendor.id,
        categories: dto.categoryIds?.length
          ? { connect: dto.categoryIds.map((id) => ({ id })) }
          : undefined,
        tags: dto.tagIds?.length
          ? { connect: dto.tagIds.map((id) => ({ id })) }
          : undefined,
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
}
