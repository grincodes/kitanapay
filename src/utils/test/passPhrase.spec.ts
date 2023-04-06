import { PassPhraseGenerator } from '../passphrase';

describe('PassPhrase Test', () => {
  it('generates a passphrase with specified number of words', () => {
    const res = PassPhraseGenerator.createPassPhrase();
    expect(res.list_of_words).toHaveLength(12);
  });

  it('should throw an error if words is greater than or equal to 64', () => {
    expect(() => {
      PassPhraseGenerator.createPassPhrase(128);
    }).toThrow(Error);
  });
});
