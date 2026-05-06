import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthTokensService } from './auth-tokens.service';

@Module({
  imports: [
    JwtModule.register({
      secret:
        process.env.JWT_SECRET?.trim() ||
        'bmp-dev-access-secret-change-in-production',
      signOptions: {
        expiresIn: process.env.JWT_ACCESS_EXPIRES?.trim() || '15m',
      },
    }),
  ],
  providers: [AuthTokensService],
  exports: [AuthTokensService, JwtModule],
})
export class JwtTokensModule {}
