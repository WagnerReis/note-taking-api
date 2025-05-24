import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import 'dotenv/config';

type ValidateResponse = {
  email: string;
  name: string;
  provider: string;
  googleId: string;
};

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      scope: ['email', 'profile'],
      passReqToCallback: false,
    });
  }
  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): ValidateResponse {
    const email = profile.emails?.[0]?.value;

    if (!email) {
      throw new Error('Email is required');
    }

    return {
      email,
      name: profile.displayName,
      provider: profile.provider,
      googleId: profile.id,
    };
  }
}
