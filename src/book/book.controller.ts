import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { Roles } from './decorators/roles.decorator';
import { BookQueryDto } from './dto/book-query.dto';
import { RolesGuard } from 'src/user/guards/roles.guard';

@Controller('books')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get()
  getAll(@Query() query: BookQueryDto) {
    return this.bookService.getAll(query);
  }

  @Get(':id')
  @Roles('ADMIN')
  getById(@Param('id') id: string) {
    return this.bookService.getById(id);
  }

  @Post()
  @Roles('ADMIN')
  create(@CurrentUser('id') userId: string, @Body() dto: CreateBookDto) {
    return this.bookService.create(userId, dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateBookDto) {
    return this.bookService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  delete(@Param('id') id: string) {
    return this.bookService.delete(id);
  }
}
