import { Exclude } from 'class-transformer';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  walletAddress: string;

  @Column({
    type: 'jsonb',
  })
  encryptedPrivateKey: Record<string, any>;

  @Column()
  passPhraseHash: string;

  @Column({
    nullable: true,
  })
  @Exclude()
  public currentHashedRefreshToken?: string;
}
