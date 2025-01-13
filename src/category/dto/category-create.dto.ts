import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CategoryCreateDto {
  @ApiProperty({ example: 'Name', description: 'Category name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 5 , description: 'Category sort' })
  sort: number;

  @ApiProperty({ example: 'image', description: 'Category image' })
  image: any;
}
