import { IsNotEmpty, IsString } from 'class-validator';

export class CreateVendorDto {
  @IsNotEmpty()
  @IsString()
  displayName: string;

  @IsNotEmpty()
  @IsString()
  subdomain: string;
}
