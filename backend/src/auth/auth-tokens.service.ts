import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface JwtAccessPayload {
  sub: string;
  role: string;
  typ: 'access';
}

@Injectable()
export class AuthTokensService {
  constructor(private readonly jwt: JwtService) {}

  private accessSecret(): string {
    return (
      process.env.JWT_SECRET?.trim() ||
      'bmp-dev-access-secret-change-in-production'
    );
  }

  private refreshSecret(): string {
    const r = process.env.JWT_REFRESH_SECRET?.trim();
    return r || this.accessSecret();
  }

  issuePair(sub: string, role: string): {
    accessToken: string;
    refreshToken: string;
  } {
    const roleNorm = String(role || '').toLowerCase().trim();
    const accessToken = this.jwt.sign(
      { sub, role: roleNorm, typ: 'access' },
      {
        secret: this.accessSecret(),
        expiresIn: process.env.JWT_ACCESS_EXPIRES?.trim() || '15m',
      },
    );
    const refreshToken = this.jwt.sign(
      { sub, typ: 'refresh' },
      {
        secret: this.refreshSecret(),
        expiresIn: process.env.JWT_REFRESH_EXPIRES?.trim() || '7d',
      },
    );
    return { accessToken, refreshToken };
  }

  async verifyAccess(token: string): Promise<JwtAccessPayload> {
    const payload = await this.jwt.verifyAsync<JwtAccessPayload>(token, {
      secret: this.accessSecret(),
    });
    if (payload.typ !== 'access') throw new UnauthorizedException();
    return payload;
  }

  async verifyRefresh(token: string): Promise<{ sub: string }> {
    const payload = await this.jwt.verifyAsync<{
      sub: string;
      typ?: string;
    }>(token, { secret: this.refreshSecret() });
    if (payload.typ !== 'refresh') throw new UnauthorizedException();
    return { sub: payload.sub };
  }
}
