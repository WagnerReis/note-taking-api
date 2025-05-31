import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Res,
  Get,
  UseGuards,
  Req,
  Logger,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { SignInUseCase } from './use-cases/sing-in.usecase';
import { AuthGuard } from '@nestjs/passport';
import { EnvService } from '../env/env.service';
import { Public } from './decorators/public.decorator';
import { AuthenticateByGoogleUseCase } from './use-cases/authenticate-by-google.usecase';
import { GoogleUser } from './use-cases/validate-or-create-google-user.usecase';
import { CurrentUser } from './decorators/current-user.decorator';
import { RefreshTokenUseCase } from './use-cases/refresh-token.usecase';

type SignInBody = {
  email: string;
  password: string;
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly signInUseCase: SignInUseCase,
    private readonly authenticateByGoogleUseCase: AuthenticateByGoogleUseCase,
    private readonly envService: EnvService,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
  ) {}

  private readonly logger: Logger = new Logger(AuthController.name);

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() signInBody: SignInBody, @Res() res: Response) {
    const result = await this.signInUseCase.execute(
      signInBody.email,
      signInBody.password,
    );

    if (result.isLeft()) {
      throw result.value;
    }

    const { accessToken, refreshToken } = result.value;

    this.setAuthCookies(res, accessToken, refreshToken);

    return res.sendStatus(HttpStatus.OK);
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

    this.setAuthCookies(res, accessToken, refreshToken);

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

    this.setAuthCookies(res, accessToken, newRefreshToken);

    return res.sendStatus(HttpStatus.OK);
  }

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    const commonOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };

    res.cookie('authToken', accessToken, commonOptions);
    res.cookie('refreshToken', refreshToken, commonOptions);
  }
}
