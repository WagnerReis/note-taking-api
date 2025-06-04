import { CookieManagerInterface } from '@/core/cookie/cookie-manager.interface';
import { Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class CookieManager implements CookieManagerInterface {
  private readonly commonOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };

  setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    res.cookie('authToken', accessToken, this.commonOptions);
    res.cookie('refreshToken', refreshToken, this.commonOptions);
  }

  clearAuthCookies(res: Response): void {
    res.clearCookie('authToken', this.commonOptions);
    res.clearCookie('refreshToken', this.commonOptions);
  }
}
