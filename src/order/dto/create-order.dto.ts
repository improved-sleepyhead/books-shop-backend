export class CreateOrderDto {
  items: CreateOrderItemDto[];
}

export class CreateOrderItemDto {
  bookId: string;
  quantity: number;
  price: number;
}