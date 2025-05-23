import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { SignInUseCase } from './use-cases/sing-in.usecase';

type SignInBody = {
  email: string;
  password: string;
};

@Controller('auth')
export class AuthController {
  constructor(private signInUseCase: SignInUseCase) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() signInBody: SignInBody, @Res() res: Response) {
    const { accessToken } = await this.signInUseCase.execute(
      signInBody.email,
      signInBody.password,
    );

    res.cookie('authToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 1000 * 60,
    });

    return res.sendStatus(HttpStatus.OK);
  }
}
