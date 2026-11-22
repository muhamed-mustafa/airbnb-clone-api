import { ApiProperty } from '@nestjs/swagger';

export class MyProfileDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ format: 'email' }) email!: string;
  @ApiProperty() phone!: string;
  @ApiProperty({
    description: 'Whether the customer email is active. Legacy accounts remain active.',
  })
  emailVerified!: boolean;
}
