import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import config from './config/config';
import { validate } from './config/custom-validation/env.validation';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { WalletsModule } from './modules/wallets/wallets.module';
import { Web3Module } from './modules/web3/web3.module';
import { BullModule } from '@nestjs/bull';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TransactionsModule } from './modules/transactions/transaction.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      validate,
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ...config.get('database'),
        synchronize: true,
        autoLoadEntities: true,
      }),
    }),
    EventEmitterModule.forRoot(),
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        return {
          config: {
            ...config.get('redis'),
          },
        };
      },
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: config.get('redis'),
      }),
    }),
    AuthenticationModule,
    Web3Module,
    WalletsModule,
    TransactionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
