import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { InjectQueue } from '@nestjs/bull';
import { BadRequestException, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import Redis from 'ioredis';
import {
  ENCRYPTED_TRANSACTION_JOB,
  Events,
  TRANSACTION_JOB,
  TRANSACTION_QUEUE,
} from 'src/shared/constants';
import { Repository } from 'typeorm';
import { Wallet } from '../wallets/schema/wallet.entity';
import { SendTransactionWithPkeyEncryptionDto } from './dto/send-transaction-with-pkey-encryption.dto';
import { SendTransactionDto } from './dto/send-transaction.dto';
import { Transaction } from './schema/transaction.entity';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
import { Web3Service } from '../web3/web3.service';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    @InjectRedis() private readonly redisClient: Redis,
    @InjectQueue(TRANSACTION_QUEUE) private readonly transactionQueue: Queue,
    private readonly web3Service: Web3Service,
  ) {}

  async sendTransactionWithPkeyEncryption(
    sendTransWithPkeyEncryptionDto: SendTransactionWithPkeyEncryptionDto,
    wallet: Wallet,
  ) {
    const passPhrase = this.redisClient.get(wallet.walletAddress);

    await this.web3Service.isTransactionValid({
      sender_address: sendTransWithPkeyEncryptionDto.from,
      value: sendTransWithPkeyEncryptionDto.value,
    });

    await this.transactionQueue.add(ENCRYPTED_TRANSACTION_JOB, {
      from: wallet.walletAddress,
      to: sendTransWithPkeyEncryptionDto.to,
      value: sendTransWithPkeyEncryptionDto.value,
      encryptedPrivateKey: wallet.encryptedPrivateKey,
      passPhrase,
    });

    const transaction = await this.transactionRepo.create({
      ...sendTransWithPkeyEncryptionDto,
      status: 'pending',
    });
    await this.transactionRepo.save(transaction);

    return {
      message: 'Transaction in progress',
    };
  }

  async sendTransaction(sendTransactionDto: SendTransactionDto) {
    try {
      await this.web3Service.isTransactionValid({
        sender_address: sendTransactionDto.from,
        value: sendTransactionDto.value,
      });

      await this.web3Service.isValidPrivateKey(sendTransactionDto.privateKey);

      //   const res = await this.web3Service.sendEthTransaction({
      //     sender_address: sendTransactionDto.from,
      //     destination_address: sendTransactionDto.to,
      //     privateKey: sendTransactionDto.privateKey,
      //     value: sendTransactionDto.value,
      //   });
      //   const transaction = await this.transactionRepo.create({
      //     ...sendTransactionDto,
      //     status: 'pending',
      //   });
      //   await this.transactionRepo.save(transaction);
      //   return res;

      await this.transactionQueue.add(TRANSACTION_JOB, {
        from: sendTransactionDto.from,
        to: sendTransactionDto.to,
        value: sendTransactionDto.value,
        privateKey: sendTransactionDto.privateKey,
      });
      const transaction = await this.transactionRepo.create({
        ...sendTransactionDto,
        status: 'pending',
      });
      await this.transactionRepo.save(transaction);
      return {
        message: 'Transaction in progress',
      };
    } catch (error) {
      throw new BadRequestException({
        message: error,
      });
    }

    // await this.transactionQueue.add(TRANSACTION_JOB, {
    //   from: sendTransactionDto.from,
    //   to: sendTransactionDto.to,
    //   value: sendTransactionDto.value,
    //   privateKey: sendTransactionDto.privateKey,
    // });

    // return {
    //   message: 'Transaction in progress',
    // };
  }

  async getAllAcounts() {
    return await this.transactionRepo.find({
      select: ['from'],
    });
  }
  async paginateGetAllAccounts(
    options: IPaginationOptions,
  ): Promise<Pagination<Transaction>> {
    const queryBuilder = this.transactionRepo.createQueryBuilder('transaction');
    queryBuilder.select('transaction.from');

    return paginate<Transaction>(queryBuilder, options);
  }

  async testJob() {
    await this.transactionQueue.add('test-job', {
      data: 'hello',
    });
    return 'done';
  }

  @OnEvent(Events.TransactionCompleted)
  async updateTransactionStatus(reciept: Record<string, any>) {
    console.log('event receipt', reciept);
    console.log(reciept.from);

    await this.transactionRepo.update(
      { from: reciept.from },
      { transactionHash: reciept.transactionHash, status: reciept.status },
    );
  }

  @OnEvent(Events.TransactionFailed)
  async transactionFailed(reciept: Record<string, any>) {
    await this.transactionRepo.update(
      { from: reciept.from },
      { transactionHash: reciept.transactionHash, status: reciept.status },
    );

    // notify user
  }
}
