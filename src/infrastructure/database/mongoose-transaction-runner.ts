import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import type { ClientSession, Connection } from 'mongoose';
import type {
  TransactionRunner,
  TransactionSession,
} from '@common/transactions/transaction-runner';

export const toClientSession = (session?: TransactionSession): ClientSession | undefined =>
  session as unknown as ClientSession | undefined;

@Injectable()
export class MongooseTransactionRunner implements TransactionRunner {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  run<T>(work: (session: TransactionSession) => Promise<T>): Promise<T> {
    return this.connection.transaction((session) => work(session as unknown as TransactionSession));
  }
}
