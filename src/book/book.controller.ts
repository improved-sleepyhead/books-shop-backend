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
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { BookQueryDto } from './dto/book-query.dto';
import { RolesGuard } from 'src/user/guards/roles.guard';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { FileUploadService } from '../file-upload/file-upload.service';
import { CurrentUser } from 'src/auth/decorators/user.decorator';

@Controller('books')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookController {
  constructor(
    private readonly bookService: BookService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Post()
  @Auth()
  @Roles('ADMIN')
  @UseInterceptors(
    FileInterceptor('coverImage'),
    FilesInterceptor('additionalImages', 10),
  )
  async create(
    @Body() dto: CreateBookDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|gif|webp)$/ }),
        ],
        fileIsRequired: false,
      })
    ) coverImage?: Express.Multer.File,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|gif|webp)$/ }),
        ],
        fileIsRequired: false,
      })
    ) additionalImages?: Express.Multer.File[],
  ) {
    let coverUrl: string | undefined;
    const imageUrls: string[] = [];

    if (coverImage) {
      coverUrl = await this.fileUploadService.upload(
        `book-cover-${Date.now()}-${coverImage.originalname}`,
        coverImage.buffer,
      );
    }

    if (additionalImages && additionalImages.length > 0) {
      for (const image of additionalImages) {
        const url = await this.fileUploadService.upload(
          `book-image-${Date.now()}-${image.originalname}`,
          image.buffer,
        );
        imageUrls.push(url);
      }
    }

    return this.bookService.create({
      ...dto,
      coverUrl,
      imageUrls,
    });
  }

  @Patch(':id')
  @Auth()
  @Roles('ADMIN')
  @UseInterceptors(
    FileInterceptor('coverImage'),
    FilesInterceptor('additionalImages', 10),
  )
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBookDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|gif|webp)$/ }),
        ],
        fileIsRequired: false,
      })
    ) coverImage?: Express.Multer.File,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|gif|webp)$/ }),
        ],
        fileIsRequired: false,
      })
    ) additionalImages?: Express.Multer.File[],
  ) {
    let coverUrl: string | undefined;
    const imageUrls: string[] = dto.existingImageUrls || [];

    if (coverImage) {
      coverUrl = await this.fileUploadService.upload(
        `book-cover-${Date.now()}-${coverImage.originalname}`,
        coverImage.buffer,
      );
    }

    if (additionalImages && additionalImages.length > 0) {
      for (const image of additionalImages) {
        const url = await this.fileUploadService.upload(
          `book-image-${Date.now()}-${image.originalname}`,
          image.buffer,
        );
        imageUrls.push(url);
      }
    }

    return this.bookService.update(id, {
      ...dto,
      coverUrl: coverUrl || dto.coverUrl,
      imageUrls,
    });
  }

  @Delete(':id/image')
  @Auth()
  @Roles('ADMIN')
  async removeImage(
    @Param('id') id: string,
    @Body('imageUrl') imageUrl: string,
  ) {
    const book = await this.bookService.getById(id);
    const updatedImageUrls = book.imageUrls?.filter(url => url !== imageUrl);

    return this.bookService.update(id, {
      imageUrls: updatedImageUrls,
    });
  }

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
