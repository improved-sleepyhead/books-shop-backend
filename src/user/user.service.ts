import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { hash } from 'argon2';
import { UpdateProfileDto, UserProfileDto } from './dto/user-profile.dto';
import { CreateUserDto, UpdateUserDto, UserDto } from './dto/user.dto';
import { UserRole } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { userProfileSelect, userSelect } from './constants/user.constants';
import { FileUploadService } from 'src/file-upload/file-upload.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private fileUploadService: FileUploadService,
  ) {}

  async getById(id: string): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userSelect,
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
      select: userProfileSelect,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      ...user,
      totalReviews: user._count.reviews,
      totalOrders: user._count.orders,
      wishlistItemsCount: user._count.wishlistItems,
    };
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
    avatarFile?: Express.Multer.File,
  ): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let avatarUrl = user.avatarUrl;

    if (avatarFile) {
      const newAvatarUrl = await this.uploadAvatar(userId, avatarFile);
      
      if (avatarUrl) {
        await this.safeDeleteAvatar(avatarUrl);
      }
      
      avatarUrl = newAvatarUrl;
    } else if (dto.avatarUrl === null) {
      if (avatarUrl) {
        await this.safeDeleteAvatar(avatarUrl);
      }
      avatarUrl = null;
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        email: dto.email,
        name: dto.name,
        avatarUrl,
      },
      select: userSelect,
    });
  }

  private async uploadAvatar(userId: string, file: Express.Multer.File): Promise<string> {
    try {
      const fileName = `user-avatars/${userId}/${Date.now()}-${file.originalname}`;
      return await this.fileUploadService.upload(fileName, file.buffer);
    } catch (error) {
      throw new BadRequestException('Failed to upload avatar');
    }
  }

  private async safeDeleteAvatar(avatarUrl: string): Promise<void> {
    try {
      await this.fileUploadService.deleteFile(avatarUrl);
    } catch (error) {
      console.error('Failed to delete avatar file:', error);
    }
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