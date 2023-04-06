import { IsEthereumAddress } from 'class-validator';

export class AccountValidatorDto {
  @IsEthereumAddress()
  account: string;
}
