import { Roles } from '@common/constants/roles.constant';
import type { JwtPayload } from '@common/interfaces/jwt-payload.interface';
import { ApiProperty } from '@nestjs/swagger';

export class CurrentUserResponseDto implements JwtPayload {
  @ApiProperty({
    description: 'Authenticated user ID from the access token.',
    example: '670d1234567890abcdef1234',
  })
  id!: string;

  @ApiProperty({
    description: 'Authenticated user role from the access token.',
    enum: Roles,
    example: Roles.USER,
  })
  role!: Roles;
}
