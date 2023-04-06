import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentWallet } from '../authentication/current-wallet.decorator';
import JwtAuthenticationGuard from '../authentication/jwt-authentication.guard';
import { Wallet } from '../wallets/schema/wallet.entity';
import { SendTransactionWithPkeyEncryptionDto } from './dto/send-transaction-with-pkey-encryption.dto';
import { SendTransactionDto } from './dto/send-transaction.dto';

import { TransactionService } from './transaction.service';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  async sendTransaction(@Body() sendTransactionDto: SendTransactionDto) {
    return await this.transactionService.sendTransaction(sendTransactionDto);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Post('with-private-key-encryption')
  async sendTransactionWithPkeyEncryption(
    @CurrentWallet() wallet: Wallet,
    @Body()
    sendTransWithPkeyEncryptionDto: SendTransactionWithPkeyEncryptionDto,
  ) {
    return await this.transactionService.sendTransactionWithPkeyEncryption(
      sendTransWithPkeyEncryptionDto,
      wallet,
    );
  }

  @Get('test')
  async test() {
    return await this.transactionService.testJob();
  }
}
