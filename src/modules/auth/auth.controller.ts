import { CookieOptions, Request, Response } from 'express';
import { AUTH } from '../../constants';
import { env } from '../../config/env';
import { ResponseUtil } from '../../utils/response';
import { LoginDto } from './auth.dto';
import { AuthService, authService } from './auth.service';

export class AuthController {
  constructor(private readonly service: AuthService) {}

  private cookieOptions(): CookieOptions {
    const production = env.NODE_ENV === 'production';
    return { httpOnly: true, secure: production, sameSite: production ? 'none' : 'lax', path: '/' };
  }

  login = async (req: Request, res: Response) => {
    const dto = req.validated as LoginDto;
    const token = this.service.login(dto, req.ip ?? 'unknown');
    res.cookie(AUTH.COOKIE_NAME, token, { ...this.cookieOptions(), maxAge: AUTH.TTL_SECONDS * 1000 });
    ResponseUtil.success(res, { email: dto.email });
  };

  logout = (_req: Request, res: Response) => {
    res.clearCookie(AUTH.COOKIE_NAME, this.cookieOptions());
    ResponseUtil.noContent(res);
  };

  me = (req: Request, res: Response) => ResponseUtil.success(res, { email: req.admin?.email });
}
export const authController = new AuthController(authService);
