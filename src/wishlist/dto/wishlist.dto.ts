export class AddToWishlistDto {
  bookId: string;
}

export class WishlistItemBookDto {
  id: string;
  title: string;
  price: number;
  coverUrl?: string | null;
}

export class WishlistItemDto {
  id: string;
  bookId: string;
  userId: string;
  isLiked: boolean;
  createdAt: Date;
  book?: WishlistItemBookDto;
}