import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { VendorService } from './vendor.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { Roles } from 'src/user/decorators/user.decorator';
import { UserRole } from '@prisma/client';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CurrentUser } from 'src/auth/decorators/user.decorator';

@Controller('vendors')
@UseGuards(JwtAuthGuard)
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  getAll() {
    return this.vendorService.getAll();
  }

  @Get(':id')
  @Auth()
  getById(@Param('id') id: string) {
    return this.vendorService.getById(id);
  }

  @Post()
  @Auth()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateVendorDto) {
    return this.vendorService.create(userId, dto);
  }

  @Patch(':id')
  @Auth()
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateVendorDto,
  ) {
    return this.vendorService.update(id, userId, dto);
  }

  @Delete(':id')
  @Auth()
  delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.vendorService.delete(id, userId);
  }
}
