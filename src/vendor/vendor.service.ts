import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { VendorDto } from './dto/vendor.dto';
import { UserService } from 'src/user/user.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class VendorService {
  constructor(
    private prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  async getAll(): Promise<VendorDto[]> {
    return this.prisma.vendor.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: string): Promise<VendorDto> {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id },
    });

    if (!vendor) throw new NotFoundException('Vendor not found');
    return vendor;
  }

  async create(userId: string, dto: CreateVendorDto): Promise<VendorDto> {
    const existingVendor = await this.prisma.vendor.findFirst({
      where: {
        OR: [
          { subdomain: dto.subdomain },
          { ownerId: userId },
        ],
      },
    });

    if (existingVendor) {
      throw new ConflictException('Vendor with same subdomain or owner already exists');
    }

    return this.prisma.$transaction(async (tx) => {
      // Создаём Vendor
      const vendor = await tx.vendor.create({
        data: {
          displayName: dto.displayName,
          subdomain: dto.subdomain,
          ownerId: userId,
        },
      });

      // Обновляем роль пользователя на VENDOR
      await this.userService.update(userId, {
        role: UserRole.VENDOR,
      });

      return vendor;
    });
  }

  async update(id: string, userId: string, dto: UpdateVendorDto): Promise<VendorDto> {
    const vendor = await this.prisma.vendor.findUnique({ where: { id } });

    if (!vendor) throw new NotFoundException('Vendor not found');
    if (vendor.ownerId !== userId) throw new ForbiddenException('You are not the owner of this vendor');

    return this.prisma.vendor.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string, userId: string): Promise<VendorDto> {
    const vendor = await this.prisma.vendor.findUnique({ where: { id } });

    if (!vendor) throw new NotFoundException('Vendor not found');
    if (vendor.ownerId !== userId) throw new ForbiddenException('You are not the owner of this vendor');

    return this.prisma.vendor.delete({ where: { id } });
  }
}
