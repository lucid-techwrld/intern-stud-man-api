export class RateLimiter {
  private hits = new Map<string, { count: number; resetAt: number }>();

  constructor(private readonly max: number, private readonly windowMs: number) {}

  isBlocked(key: string, now = Date.now()): boolean {
    const hit = this.hits.get(key);
    if (!hit || hit.resetAt <= now) {
      this.hits.delete(key);
      return false;
    }
    return hit.count >= this.max;
  }

  recordFailure(key: string, now = Date.now()): void {
    const hit = this.hits.get(key);
    if (!hit || hit.resetAt <= now) this.hits.set(key, { count: 1, resetAt: now + this.windowMs });
    else hit.count += 1;
  }

  reset(key: string): void {
    this.hits.delete(key);
  }
}
