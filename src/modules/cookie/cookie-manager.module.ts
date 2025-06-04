import { CookieManagerInterface } from '@/core/cookie/cookie-manager.interface';
import { Module } from '@nestjs/common';
import { CookieManager } from './cookie-manager';

@Module({
  providers: [
    {
      provide: CookieManagerInterface,
      useClass: CookieManager,
    },
  ],
  exports: [CookieManagerInterface],
})
export class CookieManagerModule {}
