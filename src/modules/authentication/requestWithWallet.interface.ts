import { Request } from 'express';
import { Wallet } from '../wallets/schema/wallet.entity';

interface RequestWithWallet extends Request {
  user: Wallet;
}

export default RequestWithWallet;
