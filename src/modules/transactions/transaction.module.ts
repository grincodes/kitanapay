import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TRANSACTION_QUEUE } from 'src/shared/constants';
import { Web3Module } from '../web3/web3.module';
import { Transaction } from './schema/transaction.entity';
import { TransactionsController } from './transaction.controller';
import { TransactionProcessor } from './transaction.process';
import { TransactionService } from './transaction.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    BullModule.registerQueue({
      name: TRANSACTION_QUEUE,
    }),
    Web3Module,
  ],
  controllers: [TransactionsController],
  providers: [TransactionService, TransactionProcessor],
  exports: [TransactionService],
})
export class TransactionsModule {}
