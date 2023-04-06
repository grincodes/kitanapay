import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Wallet } from '../wallets/schema/wallet.entity';

export const getCurrentWalletByContext = (
  context: ExecutionContext,
): Wallet => {
  if (context.getType() === 'http') {
    return context.switchToHttp().getRequest().user;
  }
};

export const CurrentWallet = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    getCurrentWalletByContext(context),
);
