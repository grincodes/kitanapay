/* eslint-disable @typescript-eslint/no-inferrable-types */
import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { AppService } from './app.service';
import { TransactionService } from './modules/transactions/transaction.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly transactionService: TransactionService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('balance/:account')
  async getBalance(@Param('account') account: string) {
    return await this.appService.getBalance(account);
  }

  @Get('accounts-pagination')
  async getAccountsPagination(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    limit = limit > 100 ? 100 : limit;
    return await this.transactionService.paginateGetAllAccounts({
      page,
      limit,
    });
  }
  @Get('accounts')
  async getAccounts() {
    return await this.transactionService.getAllAcounts();
  }
}
