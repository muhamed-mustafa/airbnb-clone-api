import { ApplicationError } from '@common/errors/application.error';
import type { Logger } from '@common/logging/logger';
import { LOGGER } from '@common/logging/logger.token';
import { Inject, Injectable } from '@nestjs/common';
import { ROLES } from '../../../common/constants/roles.constant';
import { SECRET_HASH_SERVICE_TOKEN } from '../../auth/services/secret-hash-service.token';
import type { SecretHashService } from '../../auth/services/secret-hash.service';
import { GenerateTokenUseCase } from '../../auth/use-cases/generate-token.usecase';
import { LoginInput } from '../inputs/login-admin.input';
import { LoginOutput } from '../outputs/login.output';
import { ADMIN_REPOSITORY } from '../repositories/admin-repository.token';
import type { AdminRepository } from '../repositories/admin.repository';

@Injectable()
export class LoginAdminUseCase {
  constructor(
    @Inject(ADMIN_REPOSITORY) private readonly adminRepository: AdminRepository,
    private readonly generateToken: GenerateTokenUseCase,
    @Inject(SECRET_HASH_SERVICE_TOKEN)
    private readonly secretHashService: SecretHashService,
    @Inject(LOGGER)
    private readonly logger: Logger,
  ) {}

  async execute(body: LoginInput): Promise<LoginOutput> {
    const admin = await this.adminRepository.findOne({ email: body.email });

    if (!admin) {
      this.logger.warn('Login failed: unknown email');
      throw new ApplicationError('INVALID_CREDENTIALS');
    }

    const isValidPassword = await this.secretHashService.verify(admin.password, body.password);

    if (!isValidPassword) {
      this.logger.warn('Login failed: invalid password', { adminId: admin.id });
      throw new ApplicationError('INVALID_CREDENTIALS');
    }

    this.logger.info('Admin logged in', { adminId: admin.id });

    const { accessToken, refreshToken } = await this.generateToken.execute({
      id: admin.id,
      role: ROLES.ADMIN,
    });

    return { accessToken, refreshToken };
  }
}
