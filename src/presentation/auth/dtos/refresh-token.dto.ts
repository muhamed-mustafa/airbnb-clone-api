import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Valid refresh token previously issued by register, login, or refresh-token.',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NzBkMTIzNDU2Nzg5MGFiY2RlZjEyMzQiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzAyNTkyMDAwfQ.example-refresh-token',
    format: 'jwt',
  })
  @IsNotEmpty()
  @IsString()
  token!: string;
}
