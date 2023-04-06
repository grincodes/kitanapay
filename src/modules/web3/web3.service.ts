import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Events } from 'src/shared/constants';
import { PassPhraseGenerator } from 'src/utils/PassPhrase';
import Web3 from 'web3';

export interface NewWalletResponse {
  walletAddress: string;
  encryptedPrivateKey: Record<string, any>;
  passPhrase: string;
}

@Injectable()
export class Web3Service {
  private web3;
  constructor(
    private configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    //https://goerli.infura.io/v3/d6c01732bb894268971127d08ca8500c
    // INFURA WEBSCOKET HTTP PROVIDER
    const httpProvider = new Web3.providers.HttpProvider(
      `https://${this.configService.get(
        'ETHEREUM_NETWORK',
      )}.infura.io/v3/${this.configService.get('INFURA_PROJECT_ID')}`,
    );

    // const httpProvider = new Web3.providers.HttpProvider(
    //   'https://goerli.infura.io/v3/d6c01732bb894268971127d08ca8500c',
    // );

    this.web3 = new Web3(httpProvider);
  }

  convertWeiToEth(amountInWei) {
    const amount = this.web3.utils.fromWei(amountInWei.toString(), 'ether');
    return Number(amount);
  }

  convertEthToWei(amountInEth) {
    const amount = this.web3.utils.toWei(amountInEth, 'ether');
    return Number(amount);
  }

  convertWeiToGwei(amountInWei) {
    const amountInGwei = this.web3.utils.fromWei(
      amountInWei.toString(),
      'Gwei',
    );
    return Number(amountInGwei);
  }

  convertGWeiToEth(amountInGwei) {
    const amountInWei = this.web3.utils.toWei(amountInGwei.toString(), 'Gwei');
    const amountInEth = this.convertWeiToEth(amountInWei);
    return Number(amountInEth);
  }

  async createNewEthWallet() {
    try {
      // Create Random Entropy
      const entropy = await this.web3.utils.randomHex(32);
      // Random Entropy as parameter
      const account = await this.web3.eth.accounts.create(entropy);
      await this.web3.eth.accounts.wallet.add(account);
      return await this.encryptAccount(account);
    } catch (error) {
      throw new Error(error);
    }
  }

  async createExistingEthWallet(privateKey: string) {
    try {
      const account = await this.web3.eth.accounts.privateKeyToAccount(
        privateKey,
      );
      await this.web3.eth.accounts.wallet.add(account);
      return await this.encryptAccount(account);
    } catch (error) {
      throw new Error(error);
    }
  }

  async encryptAccount(account): Promise<NewWalletResponse> {
    // Create passphrase
    const { phrase } = PassPhraseGenerator.createPassPhrase();
    const encryptedPrivateKey = await account.encrypt(phrase);

    return {
      walletAddress: account.address,
      encryptedPrivateKey,
      passPhrase: phrase,
    };
  }

  async decryptAccount(
    encryptedPrivateKey: Record<string, any>,
    passPhrase: string,
  ) {
    try {
      const account = await this.web3.eth.accounts.decrypt(
        encryptedPrivateKey,
        passPhrase,
      );
      return account;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getEthBalance(address) {
    try {
      const balance = await this.web3.eth.getBalance(address);

      return this.convertWeiToEth(balance);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getEthTransactionCount(address) {
    // Gets the number of transactions sent from this address
    const nounce = await this.web3.eth.getTransactionCount(address);
    return nounce;
  }

  async estimateEthTransactionGasFee({
    source_address,
    destination_address,
    value,
  }) {
    // Get gas units for transaction
    const units = await this.web3.eth.estimateGas({
      from: source_address,
      to: destination_address,
      value: this.convertEthToWei(value),
    });

    // Get current gas price from node
    const gasPrice = await this.web3.eth.getGasPrice();

    const gasPriceInGwei = Math.floor(this.convertWeiToGwei(gasPrice));

    // Pre london upgrade gas price calculation (gas units * gas price)
    // const totalGasFeeInGwei = units * gasPriceInGwei;

    // Post london update gas price calculation (gas units * (base gas price + tip))
    const tip = Math.floor(gasPriceInGwei / 6);
    const totalGasFeeInGwei = units * (gasPriceInGwei + tip);

    const gasFeeInEth = this.convertGWeiToEth(totalGasFeeInGwei);

    return gasFeeInEth.toFixed(6);
  }

  async isTransactionValid({ sender_address, value }) {
    // Check if sender eth balance is sufficient

    const balance = await this.getEthBalance(sender_address);

    if (balance < value) {
      throw new BadRequestException(
        'ETH balance not sufficient for transaction.',
      );
    }

    return true;
  }

  async isValidPrivateKey(privateKey: string) {
    // // // Check if the private key is a valid hex string
    // if (!this.web3.utils.isHexStrict(privateKey)) {
    //   throw new BadRequestException('Invalid private key');
    // }

    // Convert the private key to an Ethereum account object
    const account = await this.web3.eth.accounts.privateKeyToAccount(
      privateKey,
    );

    // Check if the resulting account object is valid
    if (!account || !account.address) {
      throw new BadRequestException('Invalid private key');
    }

    return true;
  }

  async sendEthTransactionWithPkeyEncryption({
    sender_address,
    encryptedPrivateKey,
    passPhrase,
    destination_address,
    value,
  }) {
    // Check if sender eth balance is sufficient

    const balance = await this.getEthBalance(sender_address);

    if (balance < value) {
      throw new Error('ETH balance not sufficient for transaction.');
    }

    // Get transaction count (nouce)
    /**
     * The nouce specification is used to keep track of number of transactions
     * sent from an address. Needed for security purposes and to prevent Replay attacks.
     * getTransactionCount is used to get the number of transactions from an address.
     */

    const nounce = await this.getEthTransactionCount(sender_address);

    // Construct the transaction object
    const transaction = {
      from: sender_address, // Optional can be derived from PRIVATE KEY
      to: destination_address,
      value: this.convertEthToWei(value),
      gas: 30000,
      nounce,
    };

    // decrypt account

    const account = await this.decryptAccount(encryptedPrivateKey, passPhrase);

    // Sign transaction with sender's private key
    const signedTx = await this.web3.eth.accounts.signTransaction(
      transaction,
      account.privateKey,
    );

    // Send signed transaction
    this.web3.eth
      .sendSignedTransaction(signedTx.rawTransaction)
      .on('receipt', function (receipt) {
        this.eventEmitter.emit(Events.TransactionCompleted, receipt);
      })
      .on('error', function (error) {
        console.log('error', error);
        this.eventEmitter.emit(Events.TransactionFailed, error);
      });

    return 'Transaction in progress';
  }

  async sendEthTransaction({
    sender_address,
    destination_address,
    privateKey,
    value,
  }) {
    // Get transaction count (nouce)
    /**
     * The nouce specification is used to keep track of number of transactions
     * sent from an address. Needed for security purposes and to prevent Replay attacks.
     * getTransactionCount is used to get the number of transactions from an address.
     */

    const nounce = await this.getEthTransactionCount(sender_address);

    // Construct the transaction object
    const transaction = {
      from: sender_address, // Optional can be derived from PRIVATE KEY
      to: destination_address,
      value: this.convertEthToWei(value),
      gas: 30000,
      nounce,
    };

    // Sign transaction with sender's private key
    const signedTx = await this.web3.eth.accounts.signTransaction(
      transaction,
      privateKey,
    );

    // Send signed transaction
    this.web3.eth
      .sendSignedTransaction(signedTx.rawTransaction)
      .on('receipt', (receipt) => {
        this.eventEmitter.emit(Events.TransactionCompleted, receipt);
      })
      .on('error', function (error) {
        console.log('error', error);
        this.eventEmitter.emit(Events.TransactionFailed, error);
      });

    return 'Transaction in progress';
  }

  // export const getEthTransaction = async (hash) => {
  //   const transaction = await web3.eth.getTransaction(hash);

  //   return transaction;
  // };
}
