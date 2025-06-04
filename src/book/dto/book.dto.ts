import { Decimal } from "@prisma/client/runtime/library";

export class BookDto {
  id: string;
  title: string;
  description?: string | null;
  price: Decimal;
  isbn: string;
  digital: boolean;
  author?: string | null;
  publishedAt?: Date | null;
  publisher?: string | null;
  vendorId: string;
  createdAt: Date;
  updatedAt: Date;
  averageRating?: number | null;
}