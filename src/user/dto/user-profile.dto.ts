export class UserProfileDto {
  totalBooks: number;
  totalReviews: number;
  totalOrders: number;
  vendorProfile?: {
    displayName: string;
    subdomain: string;
    totalBooks: number;
  };
}