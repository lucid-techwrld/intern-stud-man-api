export const STUDENT_STATUSES = ['Active', 'Graduated', 'Suspended', 'Deferred'] as const;
export const PAGINATION = { DEFAULT_LIMIT: 6, MAX_LIMIT: 50 } as const;
export const MIN_STUDENT_AGE = 15;
export const CACHE = { STATS_KEY: 'students:stats', STATS_TTL_SECONDS: 60 } as const;
export const PG_ERROR = { UNIQUE_VIOLATION: '23505', CHECK_VIOLATION: '23514', INVALID_TEXT: '22P02' } as const;
export const AUTH = { COOKIE_NAME: 'session', TTL_SECONDS: 8 * 60 * 60, MAX_ATTEMPTS: 5, WINDOW_MS: 15 * 60 * 1000 } as const;
