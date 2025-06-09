import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'John Doe', description: 'Employee full name' })
  @IsString()
  full_name: string;

  @ApiProperty({ example: '09-09-1999', description: 'Employee birthday' })
  @IsString()
  birthday: string;

  @ApiProperty({
    example: '+998901234567',
    description: 'Employee phone number',
  })
  @IsString()
  @IsPhoneNumber('UZ')
  phone_number: string;

  @ApiProperty({ example: 'role', description: 'Employee role' })
  @IsString()
  @IsNotEmpty()
  role: string;
}
