import crypto from 'crypto';

export class TextUtils {
  public static createRandomNumericString(numberDigits: number): string {
    const chars = '0123456789';
    let value = '';

    for (let i = numberDigits; i > 0; --i) {
      value += chars[Math.round(Math.random() * (chars.length - 1))];
    }

    return value;
  }

  public static generateRandomString(num_string: number) {
    const hex = crypto.randomBytes(num_string).toString('hex');
    return hex;
  }
}
