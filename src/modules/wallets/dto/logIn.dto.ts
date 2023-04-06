import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEthereumAddress, IsNotEmpty } from 'class-validator';

export class LogInDto {
  @ApiProperty()
  @IsEthereumAddress()
  walletAddress: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  passPhrase: string;
}

export default LogInDto;
