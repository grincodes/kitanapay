export const WEB3_MODULE_TOKEN = 'web3.token';

export enum PostgresErrorCode {
  UniqueViolation = '23505',
}

export enum Events {
  TransactionCompleted = 'transaction-completed',
  TransactionFailed = 'transaction-failed',
}

export const TRANSACTION_JOB = 'transaction-job';
export const ENCRYPTED_TRANSACTION_JOB = 'encrypted-transaction-job';
export const TRANSACTION_QUEUE = 'transaction-queue';
