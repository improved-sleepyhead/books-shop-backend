import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RemoveImageDto {
  @ApiProperty({ description: 'URL изображения для удаления' })
  @IsString()
  imageUrl: string;
}