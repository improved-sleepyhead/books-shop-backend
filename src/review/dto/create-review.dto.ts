export class CreateReviewDto {
  bookId: string;
  rating: number;
  comment?: string;
}