import { Decimal } from '@prisma/client/runtime/library';

export class ReviewDto {
  id: string;
  rating: number;
  comment?: string | null;
  bookId: string;
  userId: string;
  createdAt: Date;
}