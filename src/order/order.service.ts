import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderDto } from './dto/order.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async createOrder(
    userId: string,
    dto: CreateOrderDto,
  ): Promise<OrderDto> {
    const customer = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!customer) {
      throw new NotFoundException('User not found');
    }

    for (const item of dto.items) {
      const book = await this.prisma.book.findUnique({
        where: { id: item.bookId },
      });
      if (!book) {
        throw new NotFoundException(`Book with ID ${item.bookId} not found`);
      }
    }

    const order = await this.prisma.order.create({
      data: {
        customerId: userId,
        status: 'PENDING',
        items: {
          create: dto.items.map((item) => ({
            bookId: item.bookId,
            quantity: item.quantity,
            price: new Decimal(item.price),
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return order;
  }

  async getOrderById(id: string, userId: string): Promise<OrderDto> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.customerId !== userId && order.customer.role !== 'ADMIN') {
      throw new ForbiddenException('Access denied');
    }

    return order;
  }

  async getOrdersByUser(userId: string): Promise<OrderDto[]> {
    return this.prisma.order.findMany({
      where: { customerId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateOrderStatus(id: string, status: string): Promise<OrderDto> {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.prisma.order.update({
      where: { id },
      data: { status },
    });
  }

  async deleteOrder(id: string): Promise<OrderDto> {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.prisma.order.delete({
      where: { id },
    });
  }
}