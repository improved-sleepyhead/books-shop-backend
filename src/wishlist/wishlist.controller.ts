import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { AddToWishlistDto } from './dto/wishlist.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@ApiTags('Wishlist')
@ApiBearerAuth()
@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post()
  addToWishlist(
    @CurrentUser() userId: string,
    @Body() dto: AddToWishlistDto,
  ) {
    return this.wishlistService.addToWishlist(userId, dto);
  }

  @Delete(':bookId')
  removeFromWishlist(
    @CurrentUser() userId: string,
    @Param('bookId') bookId: string,
  ) {
    return this.wishlistService.removeFromWishlist(userId, bookId);
  }

  @Get()
  getWishlist(@CurrentUser() userId: string) {
    return this.wishlistService.getUserWishlist(userId);
  }
}