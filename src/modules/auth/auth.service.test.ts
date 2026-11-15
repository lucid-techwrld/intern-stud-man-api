import { describe, it, expect } from 'vitest';
import { AuthService } from './auth.service';

const email = 'davisayomide999@gmail.com';
const password = 'AT/INT/2046832';

const attempt = (service: AuthService, pass: string, key = 'ip') => {
  try { return service.login({ email, password: pass }, key); } catch (e) { return e; }
};

describe('AuthService', () => {
  it('issues a verifiable token for the right credentials', () => {
    const service = new AuthService();
    const token = service.login({ email, password }, 'ip-1') as string;
    expect(service.verify(token)).toEqual({ email });
  });
  it('rejects a wrong password with a field error', () => {
    expect(attempt(new AuthService(), 'wrong')).toMatchObject({ statusCode: 401, errors: { password: expect.any(String) } });
  });
  it('rejects a different email', () => {
    const service = new AuthService();
    expect(() => service.login({ email: 'someone@else.com', password }, 'ip-2')).toThrow();
  });
  it('blocks further attempts after repeated failures, even with the right password', () => {
    const service = new AuthService();
    for (let i = 0; i < 5; i++) attempt(service, 'wrong', 'ip-3');
    expect(attempt(service, password, 'ip-3')).toMatchObject({ statusCode: 429 });
  });
  it('does not accept tampered or empty tokens', () => {
    const service = new AuthService();
    expect(service.verify('not-a-token')).toBeNull();
    expect(service.verify('')).toBeNull();
  });
});
