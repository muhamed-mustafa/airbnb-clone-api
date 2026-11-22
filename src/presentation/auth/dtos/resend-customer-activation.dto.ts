import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional } from 'class-validator';

export class ResendCustomerActivationDto {
  @ApiProperty({ example: 'guest@example.com' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ enum: ['ar', 'en'] })
  @IsOptional()
  @IsIn(['ar', 'en'])
  language?: 'ar' | 'en';
}
