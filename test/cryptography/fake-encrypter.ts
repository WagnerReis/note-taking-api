import { Encrypter } from '@/core/criptografhy/encrypter';

export class FakeEncrypter implements Encrypter<null> {
  // eslint-disable-next-line @typescript-eslint/require-await
  async encrypt(payload: Record<string, unknown>): Promise<string> {
    return JSON.stringify(payload);
  }
}
