import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterExisitngWalletDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  privateKey: string;
}
