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
import { Response } from 'express';
import { SignInUseCase } from './use-cases/sing-in.usecase';
import { AuthGuard } from '@nestjs/passport';
import {
  GoogleUser,
  ValidateOrCreateGoogleUserUseCase,
} from './use-cases/validate-or-create-google-user.usecase';
import { Encrypter } from '@/core/criptografhy/encrypter';
import { EnvService } from '../env/env.service';
import { Public } from './decorators/public.decorator';

type SignInBody = {
  email: string;
  password: string;
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly signInUseCase: SignInUseCase,
    private readonly validateOrCreateGoogleUserUseCase: ValidateOrCreateGoogleUserUseCase,
    private readonly encrypter: Encrypter,
    private readonly envService: EnvService,
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

    const { accessToken } = result.value;

    res.cookie('authToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge:
        Number(this.envService.get('JWT_EXPIRATION')) * 1000 * 60 * 60 * 24,
    });

    return res.sendStatus(HttpStatus.OK);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const { user } = req;
    const result = await this.validateOrCreateGoogleUserUseCase.execute(
      user as GoogleUser,
    );

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    const { user: userDb } = result.value;

    const token = await this.encrypter.encrypt({
      sub: userDb.id,
      email: userDb.email,
    });

    res.cookie('authToken', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    this.logger.log(`Redirecting to ${this.envService.get('FRONTEND_URL')}`);

    return res.redirect(this.envService.get('FRONTEND_URL'));
  }
}
