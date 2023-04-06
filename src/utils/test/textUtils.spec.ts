import { TextUtils } from '../TextUtils';

describe('TextUtils Test', () => {
  it('should generate random hex string ', () => {
    const res = TextUtils.generateRandomString(36);
    expect(res).toBeDefined();
  });
});
