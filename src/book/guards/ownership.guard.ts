import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma.service';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesAndOwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const bookId = request.params.id;

    if (!user) return false;

    if (requiredRoles.includes(user.role)) {
      return true;
    }

    if (requiredRoles.includes('VENDORID')) {
      if (!bookId) throw new ForbiddenException('Book ID is required');

      const book = await this.prisma.book.findUnique({
        where: { id: bookId },
        select: {
          vendor: {
            select: { ownerId: true },
          },
        },
      });

      if (!book || !book.vendor) {
        throw new ForbiddenException('Book or vendor not found');
      }

      if (book.vendor.ownerId === user.id) {
        return true;
      }
    }

    throw new ForbiddenException('Access denied');
  }
}
