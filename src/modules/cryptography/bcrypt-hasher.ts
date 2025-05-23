import { compareSync, hash } from 'bcryptjs';

import { Injectable } from '@nestjs/common';
import { HashCompare } from '@/core/criptografhy/hash-compare';
import { HashGenerator } from '@/core/criptografhy/hash-generator';

@Injectable()
export class BcryptHasher implements HashCompare, HashGenerator {
  private HASH_SALT_LENGTH = 8;

  compare(plain: string, hash: string): boolean {
    return compareSync(plain, hash);
  }

  async hash(plain: string): Promise<string> {
    return await hash(plain, this.HASH_SALT_LENGTH);
  }
}
