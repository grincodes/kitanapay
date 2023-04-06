import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEthereumAddress,
  IsNotEmpty,
  IsDecimal,
} from 'class-validator';

export class SendTransactionDto {
  @ApiProperty()
  @IsEthereumAddress()
  from: string;

  @ApiProperty()
  @IsEthereumAddress()
  to: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDecimal({
    force_decimal: false,
  })
  value: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  privateKey: string;
}
