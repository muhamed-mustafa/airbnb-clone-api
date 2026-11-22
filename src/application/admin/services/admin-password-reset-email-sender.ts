export interface AdminPasswordResetEmailSender {
  isConfigured(): boolean;
  send(input: AdminPasswordResetEmail): Promise<void>;
}

export type AdminPasswordResetEmailLanguage = 'ar' | 'en';

export interface AdminPasswordResetEmail {
  to: string;
  code: string;
  expiresInMinutes: number;
  language: AdminPasswordResetEmailLanguage;
}
