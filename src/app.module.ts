import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './modules/env/env';
import { EnvService } from './modules/env/env.service';
import { EnvModule } from './modules/env/env.module';
import { AuthModule } from './modules/auth/auth.module';
import { CryptographyModule } from './modules/cryptography/cryptography.module';
import { NotesModule } from './modules/notes/notes.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';

@Module({
  imports: [
    UsersModule,
    EnvModule,
    AuthModule,
    CryptographyModule,
    MongooseModule.forRootAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (envService: EnvService) => ({
        uri: envService.get('MONGODB_URI'),
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: (env) => envSchema.parse(env),
    }),
    NotesModule,
  ],
  controllers: [],
  providers: [
    EnvService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
