import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  ForbiddenException,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, UserDto } from './dto/user.dto';
import { UpdateProfileDto, UserProfileDto } from './dto/user-profile.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Roles } from './decorators/user.decorator';
import { UserRole } from '@prisma/client';
import { UserRolesGuard } from './guards/user-routes.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
@UseGuards(JwtAuthGuard, UserRolesGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

  @Get('me')
  @Auth()
  async getCurrentUser(@CurrentUser('id') userId: string): Promise<UserDto> {
    return this.userService.getById(userId);
  }

  @Get('me/profile')
  @Auth()
  async getCurrentUserProfile(@CurrentUser('id') userId: string): Promise<UserProfileDto> {
    return this.userService.getProfile(userId);
  }

  @Patch('me/profile')
  @Auth()
  @UseInterceptors(FileInterceptor('avatar'))
  async updateCurrentUserProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|gif|webp)$/ }),
        ],
        fileIsRequired: false,
      })
    ) avatarFile?: Express.Multer.File,
  ): Promise<UserDto> {
    return this.userService.updateProfile(userId, dto, avatarFile);
  }

  @Get(':id')
  @Auth()
  @Roles('ADMIN')
  async getById(@Param('id') id: string): Promise<UserDto> {
    return this.userService.getById(id);
  }

  @Get('email/:email')
  @Auth()
  @Roles('ADMIN')
  async getByEmail(@Param('email') email: string) {
    return this.userService.getByEmail(email);
  }

  @Get()
  @Auth()
  @Roles('ADMIN')
  async getAllUsers(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.userService.getAllUsers(page, limit);
  }

  @Get(':id/profile')
  @Auth()
  @Roles('ADMIN')
  async getProfile(@Param('id') id: string): Promise<UserProfileDto> {
    return this.userService.getProfile(id);
  }

  @Post()
  @Auth()
  @Roles('ADMIN')
  async create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Patch(':id')
  @Auth()
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser('id') currentUserId: string,
    @CurrentUser('role') currentUserRole: UserRole,
  ) {
    if (currentUserRole !== UserRole.ADMIN && currentUserId !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }
    if (currentUserRole !== UserRole.ADMIN && dto.role) {
      throw new ForbiddenException('Only admins can change roles');
    }

    return this.userService.update(id, dto);
  }

  @Delete(':id')
  @Auth()
  @Roles('ADMIN')
  async delete(@Param('id') id: string) {
    return this.userService.delete(id);
  }
}