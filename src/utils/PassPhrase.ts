import * as diceware from 'diceware-passphrase';
import * as niceware from 'niceware';

export class PassPhraseGenerator {
  public static createPassPhrase(num_bytes = 24) {
    if (num_bytes >= 128) {
      throw new Error('required max number of words is 64, Try again ');
    }

    const words = niceware.generatePassphrase(num_bytes);

    return {
      list_of_words: words,
      phrase: words.join(','),
    };
  }
}
