import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    description:
      'JWT access token used to authenticate protected API requests. Include as `Authorization: Bearer <token>`.',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NzBkMTIzNDU2Nzg5MGFiY2RlZjEyMzQiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjE3MDAwMDA5MDB9.example-access-token',
    format: 'jwt',
  })
  accessToken!: string;

  @ApiProperty({
    description:
      'JWT refresh token used to obtain a new access token via `POST /auth/refresh-token`. Store securely — treat as a secret.',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NzBkMTIzNDU2Nzg5MGFiY2RlZjEyMzQiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzAyNTkyMDAwfQ.example-refresh-token',
    format: 'jwt',
  })
  refreshToken!: string;
}
