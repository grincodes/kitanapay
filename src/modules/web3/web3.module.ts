import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from 'src/config/config';
import { WEB3_MODULE_TOKEN } from 'src/shared/constants';
import { Web3Service } from './web3.service';

@Module({
  providers: [ConfigService, Web3Service],
  exports: [Web3Service],
})
export class Web3Module {}
