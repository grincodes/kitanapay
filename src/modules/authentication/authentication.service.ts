import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import TokenPayload from './tokenPayload.interface';
import { WalletService } from '../wallets/wallets.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly walletService: WalletService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async getAuthenticatedWallet(
    walletAddress: string,
    plainTextPassPhrase: string,
  ) {
    try {
      const wallet = await this.walletService.getByWalletAddress(walletAddress);
      await this.verifyPassPhrase(plainTextPassPhrase, wallet.passPhraseHash);
      return wallet;
    } catch (error) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async verifyPassPhrase(
    plainTextPassword: string,
    hashedPassPhrase: string,
  ) {
    const isPassPhraseMatching = await bcrypt.compare(
      plainTextPassword,
      hashedPassPhrase,
    );
    if (!isPassPhraseMatching) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async getWalletFromAuthenticationToken(token: string) {
    const payload: TokenPayload = this.jwtService.verify(token, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
    });
    if (payload.walletAddress) {
      return this.walletService.getByWalletAddress(payload.walletAddress);
    }
  }
}
