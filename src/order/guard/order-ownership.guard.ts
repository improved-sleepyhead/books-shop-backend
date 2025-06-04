import {
  Injectable,
  ForbiddenException,
  ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class OrderOwnershipGuard {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || !requiredRoles.includes('CUSTOMERID')) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const orderId = request.params.id;

    if (!user) throw new ForbiddenException('User not found in request');

    if (!orderId) throw new ForbiddenException('Order ID is required');

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { customerId: true },
    });

    if (!order) throw new ForbiddenException('Order not found');

    if (order.customerId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException('You are not the owner of this order');
    }

    return true;
  }
}