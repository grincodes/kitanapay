import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationModule } from '../authentication/authentication.module';
import { JwtCookieModule } from '../jwt-cookie-access-token/jwt-cookie.module';
import { Web3Module } from '../web3/web3.module';
import { Wallet } from './schema/wallet.entity';
import { WalletsController } from './wallet.controller';
import { WalletService } from './wallets.service';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet]), JwtCookieModule, Web3Module],
  controllers: [WalletsController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletsModule {}
