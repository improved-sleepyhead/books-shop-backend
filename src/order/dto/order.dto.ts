export class OrderDto {
  id: string;
  customerId: string;
  status: string;
  stripePaymentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}