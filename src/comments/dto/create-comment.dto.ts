import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 'Restaurant || Employee', description: 'Type comment' })
  @IsIn(['restaurant', 'employee'])
  target_type: 'restaurant' | 'employee';

  @ApiProperty({example: 1, description: 'Employee ID'})
  @IsString()
  target_id: number;

  @ApiProperty({example: 'John Doe', description: 'Customer full name'})
  @IsString()
  full_name: string;

  @ApiProperty({example: 'Comment', description: 'Customer comment'})
  @IsString()
  comment: string;

  @ApiProperty({example: 3, description: 'Customer rating'})
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;
}
