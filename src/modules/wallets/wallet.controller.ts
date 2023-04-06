import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticationService } from '../authentication/authentication.service';
import { JwtCookieService } from '../jwt-cookie-access-token/jwt-cookie.service';
import { RegisterExisitngWalletDto } from './dto/register.dto';
import { WalletService } from './wallets.service';

@ApiTags('Wallets')
@Controller('wallets')
export class WalletsController {
  constructor(
    private readonly walletService: WalletService,
    private readonly jwtCookieService: JwtCookieService,
    private readonly configService: ConfigService,
  ) {}

  @Post('setup-existing-wallet')
  async setupWallet(
    @Req() req: any,
    @Body() walletDto: RegisterExisitngWalletDto,
  ) {
    const wallet = await this.walletService.setupExisitingWallet(walletDto);
    console.log(wallet);

    //Auto Login
    const accessTokenCookie = this.jwtCookieService.getCookieWithJwtAccessToken(
      wallet.walletAddress,
    );
    const { cookie: refreshTokenCookie, token: refreshToken } =
      this.jwtCookieService.getCookieWithJwtRefreshToken(wallet.walletAddress);

    await this.walletService.setCurrentRefreshToken(
      refreshToken,
      wallet.walletAddress,
    );

    return {
      msg: 'copy and save passphrase in a secure place',
      wallet,
    };
  }

  @Post('create-new-wallet')
  async createNewWallet(@Req() req: any) {
    const wallet = await this.walletService.createNewWallet();
    console.log(wallet);

    //Auto Login

    req.user = wallet;
    const accessTokenCookie = this.jwtCookieService.getCookieWithJwtAccessToken(
      wallet.walletAddress,
    );
    const { cookie: refreshTokenCookie, token: refreshToken } =
      this.jwtCookieService.getCookieWithJwtRefreshToken(wallet.walletAddress);

    await this.walletService.setCurrentRefreshToken(
      refreshToken,
      wallet.walletAddress,
    );

    return {
      msg: 'copy and save passphrase in a secure place',
      wallet,
    };
  }
}
