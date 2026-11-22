export interface CustomerPasswordResetEmail {
  to: string;
  code: string;
  language: 'ar' | 'en';
  expiresInMinutes: number;
}

export interface CustomerPasswordResetEmailSender {
  isConfigured(): boolean;
  send(email: CustomerPasswordResetEmail): Promise<void>;
}
