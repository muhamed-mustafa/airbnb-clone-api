import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
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
    const user = await this.userService.create(body);
    const { accessToken, refreshToken } = await this.generateToken.execute(user.id.toString());
    return plainToInstance(AuthResponseDto, { accessToken, refreshToken });
  }
}
