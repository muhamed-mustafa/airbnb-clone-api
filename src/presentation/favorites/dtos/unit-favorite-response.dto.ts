import { UnitResponseDto } from '@presentation/units/dtos/unit-response.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UnitFavoriteResponseDto {
  @ApiProperty({ description: 'Favorite MongoDB ObjectId.', example: '670d1234567890abcdef1241' })
  id!: string;

  @ApiProperty({ description: 'Saved accommodation details.', type: UnitResponseDto })
  unit!: UnitResponseDto;

  @ApiProperty({
    description: 'When this accommodation was saved.',
    type: String,
    format: 'date-time',
  })
  createdAt!: Date;
}
