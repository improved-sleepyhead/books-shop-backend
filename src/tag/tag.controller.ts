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
import { RolesGuard } from 'src/user/guards/roles.guard';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('tags')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  @Auth()
  getAll(): Promise<TagDto[]> {
    return this.tagService.getAll();
  }

  @Get(':id')
  @Auth()
  getById(@Param('id') id: string): Promise<TagDto> {
    return this.tagService.getById(id);
  }

  @Post()
  @Auth()
  @Roles('ADMIN')
  create(@Body() dto: CreateTagDto): Promise<TagDto> {
    return this.tagService.create(dto);
  }

  @Patch(':id')
  @Auth()
  @Roles('ADMIN')
  update(
    @Param('id') id: string,
    @Body() dto: CreateTagDto,
  ): Promise<TagDto> {
    return this.tagService.update(id, dto);
  }

  @Delete(':id')
  @Auth()
  @Roles('ADMIN')
  delete(@Param('id') id: string): Promise<TagDto> {
    return this.tagService.delete(id);
  }
}