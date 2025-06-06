import { CookieManagerInterface } from '@/core/cookie/cookie-manager.interface';
import { ZodValidationPipe } from '@/core/pipes/zod-validation.pipe';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { z } from 'zod';
import { EnvService } from '../env/env.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { AuthenticateByGoogleUseCase } from './use-cases/authenticate-by-google.usecase';
import { RefreshTokenUseCase } from './use-cases/refresh-token.usecase';
import { RemoveRefreshTokenUseCase } from './use-cases/remove-refresh-token.usecase';
import { SignInUseCase } from './use-cases/sing-in.usecase';
import { GoogleUser } from './use-cases/validate-or-create-google-user.usecase';

const signInBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type SignInBody = z.infer<typeof signInBodySchema>;

@Controller('auth')
export class AuthController {
  constructor(
    private readonly signInUseCase: SignInUseCase,
    private readonly authenticateByGoogleUseCase: AuthenticateByGoogleUseCase,
    private readonly envService: EnvService,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly removeRefreshTokenUseCase: RemoveRefreshTokenUseCase,
    private readonly cookieManager: CookieManagerInterface,
  ) {}

  private readonly logger: Logger = new Logger(AuthController.name);

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UsePipes(new ZodValidationPipe(signInBodySchema))
  async signIn(@Body() signInBody: SignInBody, @Res() res: Response) {
    try {
      this.logger.log(`Login attempt for email: ${signInBody.email}`);

      const result = await this.signInUseCase.execute(
        signInBody.email,
        signInBody.password,
      );

      if (result.isLeft()) {
        const error = result.value;
        this.logger.warn(`Login failed for email: ${signInBody.email}`);
        throw error;
      }

      const { accessToken, refreshToken } = result.value;

      this.cookieManager.setAuthCookies(res, accessToken, refreshToken);

      this.logger.log(`User successfully logged in: ${signInBody.email}`);

      return res.json({
        success: true,
        message: 'Successfully logged in',
        status: 200,
      });
    } catch (error) {
      this.logger.error(`Login error for email: ${signInBody.email}`);
      throw error;
    }
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Public()
  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @CurrentUser() user: GoogleUser,
    @Res() res: Response,
  ) {
    const result = await this.authenticateByGoogleUseCase.execute(user);

    if (result.isLeft()) {
      throw new BadRequestException('Falha ao autenticar com o Google');
    }

    const { accessToken, refreshToken } = result.value;

    this.cookieManager.setAuthCookies(res, accessToken, refreshToken);

    this.logger.log(`Redirecting to ${this.envService.get('FRONTEND_URL')}`);

    return res.redirect(this.envService.get('FRONTEND_URL'));
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refreshToken'] as string;

    const result = await this.refreshTokenUseCase.execute(refreshToken);

    if (result.isLeft()) {
      const error = result.value;
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(error.message);
      }
      throw new BadRequestException(error.message);
    }

    const { accessToken, refreshToken: newRefreshToken } = result.value;

    this.cookieManager.setAuthCookies(res, accessToken, newRefreshToken);

    return res.sendStatus(HttpStatus.OK);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(
    @CurrentUser('sub') userId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      if (!userId) {
        throw new UnauthorizedException('User not authenticated');
      }

      this.logger.log(`User logout initiated: ${userId} from IP: ${req.ip}`);

      const result = await this.removeRefreshTokenUseCase.execute(userId);

      if (result.isLeft()) {
        const error = result.value;
        this.logger.error(`Logout failed for user ${userId}: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      this.cookieManager.clearAuthCookies(res);

      this.logger.log(`User successfully logged out: ${userId}`);

      return res.json({
        success: true,
        message: 'Successfully logged out',
      });
    } catch (error) {
      this.logger.error(`Logout error for user ${userId}: ${error.message}`);
      throw error;
    }
  }

  @Get('me')
  getProfile(@CurrentUser() user: { sub: string }) {
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    this.logger.log(`Profile requested for user: ${user.sub}`);

    return user;
  }
}
