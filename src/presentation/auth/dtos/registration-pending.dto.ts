import { ApiProperty } from '@nestjs/swagger';

export class RegistrationPendingDto {
  @ApiProperty({ example: 'guest@example.com' })
  email!: string;

  @ApiProperty({ example: true })
  verificationRequired!: true;
}
