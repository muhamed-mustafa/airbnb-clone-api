export interface TokenService {
  verify(token: string): Promise<{ id: string; type: string }>;
}
