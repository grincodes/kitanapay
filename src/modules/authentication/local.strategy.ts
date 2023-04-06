import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { Wallet } from '../wallets/schema/wallet.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authenticationService: AuthenticationService) {
    super({
      usernameField: 'walletAddress',
      passwordField: 'passPhrase',
    });
  }
  async validate(walletAddress: string, passPhrase: string): Promise<Wallet> {
    return this.authenticationService.getAuthenticatedWallet(
      walletAddress,
      passPhrase,
    );
  }
}
