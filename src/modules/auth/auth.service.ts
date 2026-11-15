import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { AUTH } from '../../constants';
import { env } from '../../config/env';
import { AppError } from '../../utils/AppError';
import { RateLimiter } from '../../utils/rateLimiter';
import { LoginDto } from './auth.dto';

export class AuthService {
  private readonly limiter = new RateLimiter(AUTH.MAX_ATTEMPTS, AUTH.WINDOW_MS);

  static safeEqual(a: string, b: string): boolean {
    const ha = crypto.createHash('sha256').update(a).digest();
    const hb = crypto.createHash('sha256').update(b).digest();
    return crypto.timingSafeEqual(ha, hb);
  }

  login(dto: LoginDto, clientKey: string): string {
    if (this.limiter.isBlocked(clientKey)) throw new AppError(429, 'Too many attempts. Please try again in a few minutes.');
    const emailOk = AuthService.safeEqual(dto.email, env.ADMIN_EMAIL.toLowerCase());
    const passwordOk = AuthService.safeEqual(dto.password, env.ADMIN_PASSWORD);
    if (!emailOk || !passwordOk) {
      this.limiter.recordFailure(clientKey);
      throw new AppError(401, 'Incorrect email or password', { password: 'That password isn\u2019t correct.' });
    }
    this.limiter.reset(clientKey);
    return jwt.sign({ sub: env.ADMIN_EMAIL.toLowerCase(), role: 'admin' }, env.JWT_SECRET, { expiresIn: AUTH.TTL_SECONDS });
  }

  verify(token: string): { email: string } | null {
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
      return payload.role === 'admin' && typeof payload.sub === 'string' ? { email: payload.sub } : null;
    } catch {
      return null;
    }
  }
}
export const authService = new AuthService();
