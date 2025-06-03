import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { hash } from 'argon2';
import { UserProfileDto } from './dto/user-profile.dto';
import { CreateUserDto, UpdateUserDto, UserDto } from './dto/user.dto';
import {
  userSelect,
  userWithVendorProfileSelect,
  userWithRelationsSelect,
} from './constants/user.constants';
import { UserRole } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';


@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getById(id: string): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userWithVendorProfileSelect,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  getByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: userSelect,
    });
  }

  async getAllUsers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    return this.prisma.user.findMany({
      skip,
      take: limit,
      select: userSelect,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getProfile(userId: string): Promise<UserProfileDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        ...userWithRelationsSelect,
        _count: {
          select: {
            orders: true,
            reviews: true,
          },
        },
        vendorProfile: {
          select: {
            displayName: true,
            subdomain: true,
            _count: {
              select: {
                books: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const result: UserProfileDto = {
      totalBooks: 0,
      totalReviews: user._count.reviews,
      totalOrders: user._count.orders,
    };

    if (user.vendorProfile) {
      result.vendorProfile = {
        displayName: user.vendorProfile.displayName,
        subdomain: user.vendorProfile.subdomain,
        totalBooks: user.vendorProfile._count.books,
      };
      result.totalBooks = user.vendorProfile._count.books;
    }

    return result;
  }

  async create(dto: CreateUserDto) {
    const hashedPassword = await hash(dto.password);

    return this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        role: dto.role || UserRole.CUSTOMER,
      },
      select: userSelect,
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    let data: any = {
      email: dto.email,
      name: dto.name,
    };

    if (dto.role) {
      data.role = dto.role;
    }

    if (dto.password) {
      data.password = await hash(dto.password);
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: userSelect,
    });
  }

  async delete(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent deletion of admin users
    if (user.role === UserRole.ADMIN) {
      const adminCount = await this.prisma.user.count({
        where: { role: UserRole.ADMIN },
      });

      if (adminCount <= 1) {
        throw new ForbiddenException('Cannot delete the last admin user');
      }
    }

    return this.prisma.user.delete({
      where: { id },
      select: userSelect,
    });
  }
}