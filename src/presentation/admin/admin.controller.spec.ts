import { Test, TestingModule } from '@nestjs/testing';
import type { AdminEntity } from '@application/admin/entities/admin.entity';
import { AdminService } from '@application/admin/services/admin.service';
import { AdminController } from './admin.controller';

const PUBLIC_FIELDS = ['email', 'id', 'isSuperAdmin', 'name'];

const entity = (id: string, isSuperAdmin: boolean): AdminEntity => ({
  id,
  name: `Admin ${id}`,
  email: `admin-${id}@example.com`,
  password: `stored-password-value-${id}`,
  isSuperAdmin,
});

describe('AdminController', () => {
  let controller: AdminController;
  const adminService = { findAll: jest.fn(), findOne: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [{ provide: AdminService, useValue: adminService }],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  describe('findAll', () => {
    it('returns only the public fields of each admin, keeping meta', async () => {
      const meta = {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };
      adminService.findAll.mockResolvedValue({
        data: [entity('1', true), entity('2', false)],
        meta,
      });

      const result = await controller.findAll({ page: 1, limit: 10 });

      expect(result.meta).toBe(meta);
      expect(result.data).toEqual([
        { id: '1', name: 'Admin 1', email: 'admin-1@example.com', isSuperAdmin: true },
        { id: '2', name: 'Admin 2', email: 'admin-2@example.com', isSuperAdmin: false },
      ]);
      for (const item of result.data) expect(Object.keys(item).sort()).toEqual(PUBLIC_FIELDS);
      expect(JSON.stringify(result)).not.toContain('password');
    });

    it('drops any other field the service may add later', async () => {
      const extended = { ...entity('3', false), isDeleted: false, internalNote: 'x' };
      adminService.findAll.mockResolvedValue({ data: [extended], meta: {} });

      const result = await controller.findAll({ page: 1, limit: 10 });

      expect(Object.keys(result.data[0]).sort()).toEqual(PUBLIC_FIELDS);
    });
  });

  describe('findById', () => {
    it('returns only the public fields', async () => {
      adminService.findOne.mockResolvedValue(entity('4', true));

      const result = await controller.findById({ id: '4' });

      expect(Object.keys(result).sort()).toEqual(PUBLIC_FIELDS);
      expect(JSON.stringify(result)).not.toContain('password');
    });
  });
});
