import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { AuthTokensService } from './auth-tokens.service';

/** Si un Bearer JWT valide est présent, force x-user-id / x-user-role (priorité sur les en-têtes client). */
@Injectable()
export class JwtUserInterceptor implements NestInterceptor {
  constructor(private readonly authTokens: AuthTokensService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<{ headers?: Record<string, unknown> }>();
    const raw = req.headers?.authorization;
    const auth = typeof raw === 'string' ? raw.trim() : '';
    if (!auth.toLowerCase().startsWith('bearer ')) {
      return next.handle();
    }
    const token = auth.slice(7).trim();
    if (!token) return next.handle();

    return from(
      this.authTokens.verifyAccess(token).then((p) => {
        req.headers['x-user-id'] = p.sub;
        req.headers['x-user-role'] = p.role;
      }),
    ).pipe(
      switchMap(() => next.handle()),
      catchError(() => next.handle()),
    );
  }
}
