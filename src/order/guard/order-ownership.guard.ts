import {
  Injectable,
  ForbiddenException,
  ExecutionContext,
  CanActivate,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma.service';
import { ROLES_KEY } from 'src/user/decorators/user.decorator';

@Injectable()
export class OrderOwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const hasRole = requiredRoles.some((role) => user.role === role);
    if (hasRole) {
      return true;
    }

    if (requiredRoles.includes('CUSTOMERID')) {
      const orderId = request.params.id;

      if (!orderId) {
        throw new ForbiddenException('Order ID is required');
      }

      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        select: { customerId: true },
      });

      if (!order) {
        throw new ForbiddenException('Order not found');
      }

      if (order.customerId !== user.id) {
        throw new ForbiddenException('You are not the owner of this order');
      }

      return true;
    }

    throw new ForbiddenException('Access denied');
  }
}