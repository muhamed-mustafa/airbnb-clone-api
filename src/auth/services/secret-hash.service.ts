export interface SecretHashService {
  hash(value: string): Promise<string>;
  verify(hash: string, value: string): Promise<boolean>;
}
