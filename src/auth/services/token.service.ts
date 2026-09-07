export interface TokenService {
  verify(token: string): Promise<{ id: string; type: string }>;
  generateAccessToken(userId: string): Promise<string>;
  generateRefreshToken(userId: string): Promise<string>;
}
