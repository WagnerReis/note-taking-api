import bcrypt from 'bcryptjs';

import { HashGenerator } from '../interfaces/hash-generator';
import { HashComparer } from '../interfaces/hash-comparer';

export class BcryptHasher implements HashGenerator, HashComparer {
  private readonly SALT_ROUNDS = 8;

  async hash(plaintext: string): Promise<string> {
    const hash = await bcrypt.hash(plaintext, this.SALT_ROUNDS);
    return hash;
  }

  async compare(plaintext: string, digest: string): Promise<boolean> {
    return await bcrypt.compare(plaintext, digest);
  }
}
