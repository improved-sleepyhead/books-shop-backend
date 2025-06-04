import {
  Injectable,
  ForbiddenException,
  ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma.service';
import { ROLES_KEY } from 'src/user/decorators/user.decorator';

@Injectable()
export class ReviewOwnershipGuard {
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
      const reviewId = request.params.id;

      if (!reviewId) {
        throw new ForbiddenException('Review ID is required');
      }

      const review = await this.prisma.review.findUnique({
        where: { id: reviewId },
        select: { userId: true },
      });

      if (!review) {
        throw new ForbiddenException('Review not found');
      }

      if (review.userId !== user.id) {
        throw new ForbiddenException('You are not the author of this review');
      }

      return true;
    }

    throw new ForbiddenException('Access denied');
  }
}