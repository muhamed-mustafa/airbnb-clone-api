import { BadRequestException, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ERROR_CODES } from '../../common/errors-handling/error-codes';
import { parseAndValidatePhone } from '../../common/utils/phone.util';
import { UsersService } from '../../users/users.service';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { RegisterDto } from '../dtos/register.dto';
import { GenerateTokenUseCase } from './generate-token.usecase';

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly userService: UsersService,
    private readonly generateToken: GenerateTokenUseCase,
  ) {}

  async execute(body: RegisterDto): Promise<AuthResponseDto> {
    const phoneNumber = parseAndValidatePhone(body.countryCode, body.phone);

    if (!phoneNumber) {
      throw new BadRequestException({
        code: ERROR_CODES.INVALID_PHONE_NUMBER,
        field: 'phone',
      });
    }
    const user = await this.userService.create({ ...body, phone: phoneNumber.number });
    const { accessToken, refreshToken } = await this.generateToken.execute(user.id.toString());
    return plainToInstance(AuthResponseDto, { accessToken, refreshToken });
  }
}
