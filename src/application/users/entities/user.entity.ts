export interface UserEntity {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  /** Missing on legacy accounts, which remain active. Null means pending verification. */
  emailVerifiedAt?: Date | null;
}
