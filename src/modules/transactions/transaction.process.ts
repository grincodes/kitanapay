import { OnQueueCompleted, Process, Processor } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Job } from 'bull';
import {
  ENCRYPTED_TRANSACTION_JOB,
  TRANSACTION_JOB,
  TRANSACTION_QUEUE,
} from 'src/shared/constants';
import { Web3Service } from '../web3/web3.service';

@Processor(TRANSACTION_QUEUE)
@Injectable()
export class TransactionProcessor {
  constructor(private readonly web3Service: Web3Service) {}

  @Process(TRANSACTION_JOB)
  async sendTransaction(job: Job) {
    const { from, to, value, privateKey } = job.data;
    await this.web3Service.sendEthTransaction({
      sender_address: from,
      destination_address: to,
      privateKey,
      value,
    });
  }

  @Process(ENCRYPTED_TRANSACTION_JOB)
  async sendEncryptedTransaction(job: Job) {
    const { from, to, value, encryptedPrivateKey, passPhrase } = job.data;

    await this.web3Service.sendEthTransactionWithPkeyEncryption({
      sender_address: from,
      encryptedPrivateKey,
      passPhrase,
      destination_address: to,
      value,
    });
  }

  @Process('test-job')
  async testJob(job) {
    console.log(job);
  }

  @OnQueueCompleted()
  onActive(job: Job) {
    console.log(` job ${job.id} completed ...`);
  }
}
