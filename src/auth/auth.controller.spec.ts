import { Test, TestingModule } from '@nestjs/testing';
import { RequestContext } from '../common/request-context/request-context';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            refreshToken: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

describe('RequestContext', () => {
  it('should preserve context across async operations', async () => {
    const requestContext = new RequestContext();

    await requestContext.run({ requestId: 'request-123' }, async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(requestContext.get()).toEqual({
        requestId: 'request-123',
      });
    });
  });
});
