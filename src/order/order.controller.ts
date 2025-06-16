import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Patch,
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { Roles } from 'src/user/decorators/user.decorator';
import { OrderOwnershipGuard } from './guard/order-ownership.guard';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard, OrderOwnershipGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateOrderDto) {
    return this.orderService.createOrder(userId, dto);
  }

  @Get(':id')
  @Roles('CUSTOMERID', 'ADMIN')
  getById(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.orderService.getOrderById(id, userId);
  }

  @Get()
  @Roles('CUSTOMERID', 'ADMIN')
  getByUser(
    @CurrentUser('id') userId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.orderService.getOrdersByUser(userId, pagination);
  }

  @Delete(':id')
  @Roles('ADMIN')
  delete(@Param('id') id: string) {
    return this.orderService.deleteOrder(id);
  }

  @Patch(':id/status')
  @Roles('ADMIN')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.orderService.updateOrderStatus(id, status);
  }
}