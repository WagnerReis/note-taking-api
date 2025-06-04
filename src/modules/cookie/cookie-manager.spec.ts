import { Response } from 'express';
import { CookieManager } from './cookie-manager';

describe('CookieManager', () => {
  let sut: CookieManager;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockResponse = {
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    };
    sut = new CookieManager();
  });

  describe('setAuthCookies', () => {
    it('should set auth and refresh tokens with correct options', () => {
      const accessToken = 'test-access-token';
      const refreshToken = 'test-refresh-token';
      const expectedOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      };

      sut.setAuthCookies(mockResponse as Response, accessToken, refreshToken);

      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'authToken',
        accessToken,
        expectedOptions,
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        refreshToken,
        expectedOptions,
      );
    });
  });

  describe('clearAuthCookies', () => {
    it('should clear auth and refresh cookies with correct options', () => {
      const expectedOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      };

      sut.clearAuthCookies(mockResponse as Response);

      expect(mockResponse.clearCookie).toHaveBeenCalledTimes(2);
      expect(mockResponse.clearCookie).toHaveBeenCalledWith(
        'authToken',
        expectedOptions,
      );
      expect(mockResponse.clearCookie).toHaveBeenCalledWith(
        'refreshToken',
        expectedOptions,
      );
    });
  });
});
