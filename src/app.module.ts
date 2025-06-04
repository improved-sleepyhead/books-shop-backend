import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { VendorModule } from './vendor/vendor.module';
import { BookModule } from './book/book.module';
import { OrderModule } from './order/order.module';
import { ReviewModule } from './review/review.module';
import { CategoryModule } from './category/category.module';
import { TagModule } from './tag/tag.module';

@Module({
  imports: [AuthModule, UserModule, VendorModule, BookModule, OrderModule, ReviewModule, CategoryModule, TagModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
