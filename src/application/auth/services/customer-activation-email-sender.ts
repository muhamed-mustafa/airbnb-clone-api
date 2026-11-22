export interface CustomerActivationEmail {
  to: string;
  code: string;
  language: 'ar' | 'en';
  expiresInMinutes: number;
}

export interface CustomerActivationEmailSender {
  isConfigured(): boolean;
  send(email: CustomerActivationEmail): Promise<void>;
}
