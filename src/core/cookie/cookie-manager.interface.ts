import { Response } from 'express';

export abstract class CookieManagerInterface {
  abstract setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ): void;
  abstract clearAuthCookies(res: Response): void;
}
