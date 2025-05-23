import { Module } from '@nestjs/common';

import { BcryptHasher } from './bcrypt-hasher';
import { JwtEncrypter } from './jwt-encrypter';
import { Encrypter } from '@/core/criptografhy/encrypter';
import { HashCompare } from '@/core/criptografhy/hash-compare';
import { HashGenerator } from '@/core/criptografhy/hash-generator';

@Module({
  providers: [
    {
      provide: Encrypter,
      useClass: JwtEncrypter,
    },
    {
      provide: HashCompare,
      useClass: BcryptHasher,
    },
    {
      provide: HashGenerator,
      useClass: BcryptHasher,
    },
  ],
  exports: [Encrypter, HashCompare, HashGenerator],
})
export class CryptographyModule {}
