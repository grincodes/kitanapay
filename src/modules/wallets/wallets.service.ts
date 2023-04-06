import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Web3Service } from '../web3/web3.service';
import * as bcrypt from 'bcrypt';
import { PostgresErrorCode } from 'src/shared/constants';
import { Wallet } from './schema/wallet.entity';
import { RegisterExisitngWalletDto } from './dto/register.dto';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    private readonly web3Service: Web3Service,
    @InjectRedis() private readonly redisClient: Redis,
  ) {}

  async setupExisitingWallet(walletDto: RegisterExisitngWalletDto) {
    try {
      const { passPhrase, ...walletRes } =
        await this.web3Service.createExistingEthWallet(walletDto.privateKey);

      await this.redisClient.set(walletRes.walletAddress, passPhrase);

      const passPhraseHash = await bcrypt.hash(passPhrase, 10);

      const newWallet = {
        ...walletRes,
        passPhraseHash,
      };

      const wallet = await this.walletRepository.create(newWallet);
      await this.walletRepository.save(wallet);
      return {
        ...walletRes,
        passPhrase,
      };
    } catch (error) {
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new HttpException(
          'Wallet address already exists',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createNewWallet() {
    try {
      const { passPhrase, ...walletRes } =
        await this.web3Service.createNewEthWallet();

      await this.redisClient.set(walletRes.walletAddress, passPhrase);

      const passPhraseHash = await bcrypt.hash(passPhrase, 10);

      const newWallet = {
        ...walletRes,
        passPhraseHash,
      };

      const wallet = await this.walletRepository.create(newWallet);
      await this.walletRepository.save(wallet);
      return {
        ...walletRes,
        passPhrase,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getByWalletAddress(walletAddress: string) {
    const wallet = await this.walletRepository.findOneBy({ walletAddress });
    if (wallet) {
      return wallet;
    }
    throw new HttpException('Wallet does not exist', HttpStatus.NOT_FOUND);
  }

  async setCurrentRefreshToken(refreshToken: string, walletAddress: string) {
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.walletRepository.update(
      { walletAddress },
      {
        currentHashedRefreshToken,
      },
    );
  }

  async removeRefreshToken(walletAddress: string) {
    return this.walletRepository.update(walletAddress, {
      currentHashedRefreshToken: null,
    });
  }

  async getWalletIfRefreshTokenMatches(
    refreshToken: string,
    walletAddress: string,
  ) {
    const wallet = await this.getByWalletAddress(walletAddress);

    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      wallet.currentHashedRefreshToken,
    );

    if (isRefreshTokenMatching) {
      return wallet;
    }
  }
}
