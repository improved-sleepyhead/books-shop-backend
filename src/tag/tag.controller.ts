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
import { TagService } from './tag.service'
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { Roles } from 'src/user/decorators/user.decorator';
import { TagDto } from './dto/tag.dto';
import { CreateTagDto } from './dto/create-tag.dto';
import { RolesGuard } from './guard/roles.guard';

@Controller('tags')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  getAll(): Promise<TagDto[]> {
    return this.tagService.getAll();
  }

  @Get(':id')
  getById(@Param('id') id: string): Promise<TagDto> {
    return this.tagService.getById(id);
  }

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateTagDto): Promise<TagDto> {
    return this.tagService.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id') id: string,
    @Body() dto: CreateTagDto,
  ): Promise<TagDto> {
    return this.tagService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  delete(@Param('id') id: string): Promise<TagDto> {
    return this.tagService.delete(id);
  }
}