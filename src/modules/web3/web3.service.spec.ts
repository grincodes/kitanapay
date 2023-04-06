import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import config from 'src/config/config';
import { validate } from 'src/config/custom-validation/env.validation';
import Web3 from 'web3';

import { Web3Service } from './web3.service';

describe('Web3Service', () => {
  let service: Web3Service;
  const existingPKey =
    '0x5af2efd8a1a1f6805dd24b588fc9a9bc368100d978a3d248df8009024fdad5f9';

  const fakePkey = '844949';

  const walletAddress = '0xa3574B407af223C52f14fA9755A8b65c7be3F1D9';

  const invalidTransaction = {
    sender_address: '0x5a5f71d3B8F00d521C0F306d2571A0c12CFC35Df',
    encryptedPrivateKey: {
      version: 3,
      id: 'e6e76a80-840b-4168-917d-7cf962498a12',
      address: '5a5f71d3b8f00d521c0f306d2571a0c12cfc35df',
      crypto: {
        ciphertext:
          'af3ad0f86def23b6f308c4d012badac211da286ca4ea786a78ab9e88d6d0b1a3',
        cipherparams: {
          iv: '0bf4a3dcb5cc7b4feda3c0734e6feeae',
        },
        cipher: 'aes-128-ctr',
        kdf: 'scrypt',
        kdfparams: {
          dklen: 32,
          salt: '4a76316aefa834335bd6b971993d5d08ae40207ddc1d2be72792b6c40fe8929b',
          n: 8192,
          r: 8,
          p: 1,
        },
        mac: 'cfcbcd232414d8e3efb0072f5c11de5298670e582bb5ba30cc1a082302589b97',
      },
    },
    passPhrase:
      'nomad,ernest,clog,curly,manufacture,angularity,siree,ganglion,support,antitank,libeller,turbaned',
    destination_address: '0xa3574B407af223C52f14fA9755A8b65c7be3F1D9',
    value: '5',
  };

  const validTransaction = {
    sender_address: '0x5a5f71d3B8F00d521C0F306d2571A0c12CFC35Df',
    encryptedPrivateKey: {
      version: 3,
      id: 'e6e76a80-840b-4168-917d-7cf962498a12',
      address: '5a5f71d3b8f00d521c0f306d2571a0c12cfc35df',
      crypto: {
        ciphertext:
          'af3ad0f86def23b6f308c4d012badac211da286ca4ea786a78ab9e88d6d0b1a3',
        cipherparams: {
          iv: '0bf4a3dcb5cc7b4feda3c0734e6feeae',
        },
        cipher: 'aes-128-ctr',
        kdf: 'scrypt',
        kdfparams: {
          dklen: 32,
          salt: '4a76316aefa834335bd6b971993d5d08ae40207ddc1d2be72792b6c40fe8929b',
          n: 8192,
          r: 8,
          p: 1,
        },
        mac: 'cfcbcd232414d8e3efb0072f5c11de5298670e582bb5ba30cc1a082302589b97',
      },
    },
    passPhrase:
      'nomad,ernest,clog,curly,manufacture,angularity,siree,ganglion,support,antitank,libeller,turbaned',
    destination_address: '0xa3574B407af223C52f14fA9755A8b65c7be3F1D9',
    value: '0.004',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Web3Service],
      imports: [
        ConfigModule.forRoot({
          ignoreEnvVars: true,
          ignoreEnvFile: true,
          load: [
            () => ({
              ETHEREUM_NETWORK: 'goerli',
              INFURA_PROJECT_ID: 'd6c01732bb894268971127d08ca8500c',
            }),
          ],
        }),
        EventEmitterModule.forRoot(),
      ],
    }).compile();

    service = module.get<Web3Service>(Web3Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // it('should create wallet', async () => {
  //   const res = await service.createNewEthWallet();
  //   expect(res).toHaveProperty('walletAddress');
  // });

  // it('should create a wallet from existing wallet privatekey', async () => {
  //   const res = await service.createExistingEthWallet(existingPKey);
  //   expect(res).toHaveProperty('walletAddress');
  // });

  // it('should fail to create wallet when you pass wrong private key ', async () => {
  //   await expect(service.createExistingEthWallet(fakePkey)).rejects.toThrow();
  // });

  it('should get eth balance of wallet', async () => {
    const res = await service.getEthBalance(walletAddress);
    expect(res).toBeDefined();
  });

  it('should fail when you try to send more eth than balance', async () => {
    await expect(
      service.sendEthTransactionWithPkeyEncryption(invalidTransaction),
    ).rejects.toThrow();
  }, 30000);

  it('should be able to send eth to another wallet', async () => {
    const res = await service.sendEthTransactionWithPkeyEncryption(
      validTransaction,
    );
    expect(res).toBeDefined();
  }, 30000);
});
