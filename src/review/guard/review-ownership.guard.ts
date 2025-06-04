import {
  Injectable,
  ForbiddenException,
  ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ReviewOwnershipGuard {
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
    const reviewId = request.params.id;

    if (!user) throw new ForbiddenException('User not found in request');

    if (!reviewId) throw new ForbiddenException('Review ID is required');

    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      select: { userId: true },
    });

    if (!review) throw new ForbiddenException('Review not found');

    if (review.userId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException('You are not the author of this review');
    }

    return true;
  }
}