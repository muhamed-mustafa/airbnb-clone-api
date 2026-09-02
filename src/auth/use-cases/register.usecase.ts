import { BadRequestException, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ERROR_CODES } from '../../common/errors-handling/error-codes';
import { parseAndValidatePhone } from '../../common/utils/phone.util';
import { UsersService } from '../../users/users.service';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { RegisterInput } from '../inputs/register.input';
import { RegisterOutput } from '../outputs/register.output';
import { PasswordService } from '../services/password.service';
import { GenerateTokenUseCase } from './generate-token.usecase';

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly userService: UsersService,
    private readonly generateToken: GenerateTokenUseCase,
    private readonly passwordService: PasswordService,
  ) {}

  async execute(body: RegisterInput): Promise<RegisterOutput> {
    const phoneNumber = parseAndValidatePhone(body.countryCode, body.phone);

    if (!phoneNumber) {
      throw new BadRequestException({
        code: ERROR_CODES.INVALID_PHONE_NUMBER,
        field: 'phone',
      });
    }

    const password = await this.passwordService.hash(body.password);

    const user = await this.userService.create({ ...body, password, phone: phoneNumber });

    const { accessToken, refreshToken } = await this.generateToken.execute(user.id.toString());

    return plainToInstance(AuthResponseDto, { accessToken, refreshToken });
  }
}
