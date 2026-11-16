export const ADMIN_PASSWORD_RESET_OPTIONS = Symbol('ADMIN_PASSWORD_RESET_OPTIONS');

export interface AdminPasswordResetOptions {
  codeTtlMinutes: number;
  resetTokenTtlMinutes: number;
}
