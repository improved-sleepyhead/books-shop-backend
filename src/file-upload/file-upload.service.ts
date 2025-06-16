import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class FileUploadService {
  private region: string;
  private s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.region = this.configService.getOrThrow('AWS_S3_REGION');
    this.s3Client = new S3Client({
      region: this.region,
      endpoint: 'https://s3.ru-7.storage.selcloud.ru',
      credentials: {
        accessKeyId: this.configService.getOrThrow('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow('AWS_SECRET_ACCESS_KEY'),
      }
    });
  }

  private getMimeType(filename: string): string {
    const extension = filename.includes('.') 
    ? filename.split('.').pop()?.toLowerCase() ?? ''
    : '';
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
      pdf: 'application/pdf',
      zip: 'application/zip',
      txt: 'text/plain'
    };
    return mimeTypes[extension] || 'application/octet-stream';
  }

  async upload(fileName: string, file: Buffer) {
    const bucket = this.configService.get('AWS_BUCKET');
    const mimeType = this.getMimeType(fileName);
    
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: fileName,
        Body: file,
        ACL: 'public-read',
        ContentType: mimeType,
        ContentDisposition: mimeType.startsWith('image/') 
          ? 'inline; filename="' + encodeURIComponent(fileName) + '"'
          : 'attachment'
      })
    );

    return `https://f7b01721-dc41-43b6-af3e-346f5350e186.selstorage.ru/${fileName}`
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const bucket = this.configService.get('AWS_BUCKET');
      const fileName = fileUrl.split('/').pop();
      
      if (!fileName) {
        throw new Error('Invalid file URL');
      }

      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: fileName,
        })
      );
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }
}