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
import { Roles } from '../common/decorators/roles.decorator';
import { BookQueryDto } from './dto/book-query.dto';
import { RolesGuard } from 'src/user/guards/roles.guard';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('books')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get()
  @Auth()
  getAll(@Query() query: BookQueryDto) {
    return this.bookService.getAll(query);
  }

  @Get(':id')
  @Auth()
  @Roles('ADMIN')
  getById(@Param('id') id: string) {
    return this.bookService.getById(id);
  }

  @Post()
  @Auth()
  @Roles('ADMIN')
  create(@Body() dto: CreateBookDto) {
    return this.bookService.create(dto);
  }

  @Patch(':id')
  @Auth()
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateBookDto) {
    return this.bookService.update(id, dto);
  }

  @Delete(':id')
  @Auth()
  @Roles('ADMIN')
  delete(@Param('id') id: string) {
    return this.bookService.delete(id);
  }

  @Post(':id/favorite')
  @Auth()
  toggleFavorite(
    @Param('id') bookId: string,
    @CurrentUser('id') userId: string
  ) {
    return this.bookService.toggleFavorite(userId, bookId);
  }

  @Get('user/favorites')
  @Auth()
  getFavorites(
    @CurrentUser('id') userId: string,
    @Query() query: Omit<BookQueryDto, 'userId' | 'isFavorite'>
  ) {
    return this.bookService.getFavorites(userId, query);
  }
}
