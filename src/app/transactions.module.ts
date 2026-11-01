import { TRANSACTION_RUNNER } from '@common/transactions/transaction-runner.token';
import { Module } from '@nestjs/common';
import { MongooseTransactionRunner } from '../infrastructure/database/mongoose-transaction-runner';

@Module({
  providers: [
    {
      provide: TRANSACTION_RUNNER,
      useClass: MongooseTransactionRunner,
    },
  ],
  exports: [TRANSACTION_RUNNER],
})
export class TransactionsModule {}
