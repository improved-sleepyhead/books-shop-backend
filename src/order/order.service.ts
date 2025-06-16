import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderDto } from './dto/order.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { PaginationDto } from 'src/common/dto/pagination.dto';

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

    let totalAmount = new Decimal(0);
    for (const item of dto.items) {
      const book = await this.prisma.book.findUnique({
        where: { id: item.bookId },
      });
      if (!book) {
        throw new NotFoundException(`Book with ID ${item.bookId} not found`);
      }
      totalAmount = totalAmount.plus(new Decimal(item.price).times(item.quantity));
    }

    const order = await this.prisma.order.create({
      data: {
        customerId: userId,
        status: 'PENDING',
        totalAmount,
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
        items: {
          include: {
            book: true,
          },
        },
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

  async getOrdersByUser(
    userId: string,
    pagination?: PaginationDto,
  ): Promise<{ data: OrderDto[]; total: number }> {
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { customerId: userId },
        orderBy: { createdAt: 'desc' },
        skip: pagination?.skip,
        take: pagination?.limit,
        include: {
          items: {
            include: {
              book: true,
            },
          },
        },
      }),
      this.prisma.order.count({
        where: { customerId: userId },
      }),
    ]);

    return { data: orders, total };
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