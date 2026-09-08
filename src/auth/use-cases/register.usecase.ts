import { Inject, Injectable } from '@nestjs/common';
import { ApplicationError } from '../../common/errors/application.error';
import { parseAndValidatePhone } from '../../common/utils/phone.util';
import { UsersService } from '../../users/users.service';
import { RegisterInput } from '../inputs/register.input';
import { RegisterOutput } from '../outputs/register.output';
import { SECRET_HASH_SERVICE_TOKEN } from '../services/secret-hash-service.token';
import type { SecretHashService } from '../services/secret-hash.service';
import { GenerateTokenUseCase } from './generate-token.usecase';

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly userService: UsersService,
    private readonly generateToken: GenerateTokenUseCase,
    @Inject(SECRET_HASH_SERVICE_TOKEN)
    private readonly secretHashService: SecretHashService,
  ) {}

  async execute(body: RegisterInput): Promise<RegisterOutput> {
    const phoneNumber = parseAndValidatePhone(body.countryCode, body.phone);

    if (!phoneNumber) {
      throw new ApplicationError('INVALID_PHONE_NUMBER');
    }

    const password = await this.secretHashService.hash(body.password);

    const user = await this.userService.create({
      name: body.name,
      email: body.email,
      phone: phoneNumber,
      password,
    });

    const { accessToken, refreshToken } = await this.generateToken.execute(user.id);

    return { accessToken, refreshToken };
  }
}
