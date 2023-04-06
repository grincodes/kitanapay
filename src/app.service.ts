import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Web3Service } from './modules/web3/web3.service';

@Injectable()
export class AppService {
  constructor(private readonly web3Service: Web3Service) {}
  getHello(): string {
    return 'Hello World!';
  }

  async getBalance(walletAddress: string) {
    try {
      const balance = await this.web3Service.getEthBalance(walletAddress);
      return {
        status: 'success',
        balance,
      };
    } catch (err) {
      console.log(err);

      throw new BadRequestException({
        message: err,
      });
    }
  }
}
