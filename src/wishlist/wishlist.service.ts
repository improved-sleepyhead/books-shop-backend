import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AddToWishlistDto, WishlistItemDto } from './dto/wishlist.dto';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  private toDto({ id, bookId, userId, isLiked, createdAt, book }: any): WishlistItemDto {
    return {
      id, bookId, userId, isLiked, createdAt,
      book: book && {
        id: book.id,
        title: book.title,
        price: Number(book.price),
        coverUrl: book.coverUrl ?? undefined
      }
    };
  }

  async addToWishlist(userId: string, dto: AddToWishlistDto): Promise<WishlistItemDto> {
    const existingItem = await this.prisma.wishlistItem.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId: dto.bookId,
        },
      },
      include: { book: true },
    });

    if (existingItem) {
      const updated = await this.prisma.wishlistItem.update({
        where: { id: existingItem.id },
        data: { isLiked: true },
        include: { book: true },
      });
      return this.toDto(updated);
    }

    const created = await this.prisma.wishlistItem.create({
      data: {
        userId,
        bookId: dto.bookId,
        isLiked: true,
      },
      include: { book: true },
    });
    return this.toDto(created);
  }

  async removeFromWishlist(userId: string, bookId: string): Promise<void> {
    await this.prisma.wishlistItem.deleteMany({
      where: {
        userId,
        bookId,
      },
    });
  }

  async getUserWishlist(userId: string): Promise<WishlistItemDto[]> {
    const items = await this.prisma.wishlistItem.findMany({
      where: { userId, isLiked: true },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            coverUrl: true,
            price: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return items.map(this.toDto);
  }
}