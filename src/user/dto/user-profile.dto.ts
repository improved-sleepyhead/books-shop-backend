import { IsString, IsOptional, IsEmail } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class UserProfileDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'User email address' })
  email: string;

  @ApiProperty({ description: 'User full name' })
  name: string;

  @ApiProperty({ 
    description: 'User role',
    enum: UserRole,
    example: UserRole.CUSTOMER 
  })
  role: UserRole;

  @ApiProperty({ 
    description: 'URL to user avatar image',
    nullable: true,
    required: false
  })
  avatarUrl?: string | null;

  @ApiProperty({ description: 'User creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  @ApiProperty({ 
    description: 'Total number of reviews created by user',
    default: 0 
  })
  totalReviews: number;

  @ApiProperty({ 
    description: 'Total number of orders created by user',
    default: 0 
  })
  totalOrders: number;

  @ApiProperty({
    description: 'User wishlist items count',
    default: 0,
    required: false
  })
  wishlistItemsCount?: number;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}