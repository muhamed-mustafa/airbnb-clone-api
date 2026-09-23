declare const transactionSessionBrand: unique symbol;

// Opaque handle: only the infrastructure implementation knows the concrete session type.
export interface TransactionSession {
  readonly [transactionSessionBrand]: never;
}

export interface TransactionRunner {
  run<T>(work: (session: TransactionSession) => Promise<T>): Promise<T>;
}
