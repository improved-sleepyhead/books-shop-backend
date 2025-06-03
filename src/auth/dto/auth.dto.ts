import { IsEmail, IsString, MinLength } from "class-validator"

export class AuthDto {
    constructor(email: string, password: string) {
        this.email = email;
        this.password = password;
    }

    @IsString()
    name: string

    @IsEmail()
    email: string

    @MinLength(8, {
        message: 'Password must be at least 8 characters long'
    })
    @IsString()
    password: string
}

import { UserRole } from '@prisma/client';

export class UserDto {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}