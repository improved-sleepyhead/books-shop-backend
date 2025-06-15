import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';

import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { Roles } from 'src/user/decorators/user.decorator';
import { CategoryDto } from './dto/category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { RolesGuard } from 'src/user/guards/roles.guard';

@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  getAll(): Promise<CategoryDto[]> {
    return this.categoryService.getAll();
  }

  @Get(':id')
  getById(@Param('id') id: string): Promise<CategoryDto> {
    return this.categoryService.getById(id);
  }

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateCategoryDto): Promise<CategoryDto> {
    return this.categoryService.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id') id: string,
    @Body() dto: CreateCategoryDto,
  ): Promise<CategoryDto> {
    return this.categoryService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  delete(@Param('id') id: string): Promise<CategoryDto> {
    return this.categoryService.delete(id);
  }
}