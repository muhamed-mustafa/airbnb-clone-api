import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional } from 'class-validator';

export class RequestCustomerPasswordResetDto {
  @ApiProperty({ example: 'guest@example.com' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ enum: ['ar', 'en'], default: 'ar' })
  @IsOptional()
  @IsIn(['ar', 'en'])
  language?: 'ar' | 'en';
}
