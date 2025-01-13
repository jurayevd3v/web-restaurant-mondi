import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AdminCreateDto {
  @ApiProperty({ example: 'Joh Doe', description: 'Admin name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'john@gmail.com', description: 'Admin email' })
  @IsEmail()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'qwerty', description: 'Admin password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, {})
  password: string;
}