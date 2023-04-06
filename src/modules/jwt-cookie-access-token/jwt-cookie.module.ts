import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { JwtCookieService } from './jwt-cookie.service';

@Module({
  imports: [ConfigModule, JwtModule.register({})],
  providers: [JwtCookieService],
  exports: [JwtCookieService],
})
export class JwtCookieModule {}
