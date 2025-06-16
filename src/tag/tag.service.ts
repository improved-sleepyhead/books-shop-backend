import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { TagDto } from './dto/tag.dto';
import { generateSlug } from 'src/common/services/slug-generator.service';

@Injectable()
export class TagService {
  constructor(private prisma: PrismaService) {}

  async getAll(): Promise<TagDto[]> {
    return this.prisma.tag.findMany();
  }

  async getById(id: string): Promise<TagDto> {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return tag;
  }

  async create(dto: CreateTagDto): Promise<TagDto> {
    return this.prisma.tag.create({
      data: {
        name: dto.name,
        slug: generateSlug(dto.name),
      },
    });
  }

  async update(id: string, dto: CreateTagDto): Promise<TagDto> {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return this.prisma.tag.update({
      where: { id },
      data: {
        name: dto.name,
      },
    });
  }

  async delete(id: string): Promise<TagDto> {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return this.prisma.tag.delete({
      where: { id },
    });
  }
}