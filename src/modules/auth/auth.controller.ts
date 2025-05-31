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
} from '@nestjs/common';
import { Request, Response } from 'express';
import { SignInUseCase } from './use-cases/sing-in.usecase';
import { AuthGuard } from '@nestjs/passport';
import { EnvService } from '../env/env.service';
import { Public } from './decorators/public.decorator';
import { AuthenticateByGoogleUseCase } from './use-cases/authenticate-by-google.usecase';
import { GoogleUser } from './use-cases/validate-or-create-google-user.usecase';
import { GenerateTokensUseCase } from './use-cases/generate-tokens.usecase';
import { CurrentUser } from './decorators/current-user.decorator';

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
    private readonly generateTokensUseCase: GenerateTokensUseCase,
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
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const { user } = req;

    const result = await this.authenticateByGoogleUseCase.execute(
      user as GoogleUser,
    );

    if (result.isLeft()) {
      throw new BadRequestException('Falha ao autenticar com o Google');
    }

    const { accessToken, refreshToken } = result.value;

    this.setAuthCookies(res, accessToken, refreshToken);

    this.logger.log(`Redirecting to ${this.envService.get('FRONTEND_URL')}`);

    return res.redirect(this.envService.get('FRONTEND_URL'));
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@CurrentUser('sub') userId: string, @Res() res: Response) {
    const result = await this.generateTokensUseCase.execute(userId);

    if (result.isLeft()) {
      throw new BadRequestException('Invalid refresh token or user');
    }

    const { accessToken, refreshToken } = result.value;

    this.setAuthCookies(res, accessToken, refreshToken);

    return { message: 'Tokens refreshed' };
  }

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    const commonOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
    };

    res.cookie('authToken', accessToken, commonOptions);
    res.cookie('refreshToken', refreshToken, commonOptions);
  }
}
