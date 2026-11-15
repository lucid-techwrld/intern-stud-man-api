import winston from 'winston';
import { env } from '../config/env';

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format:
    env.NODE_ENV === 'production'
      ? winston.format.combine(winston.format.timestamp(), winston.format.json())
      : winston.format.combine(winston.format.colorize(), winston.format.timestamp({ format: 'HH:mm:ss' }),
          winston.format.printf(({ timestamp, level, message, ...rest }) =>
            `${timestamp} ${level} ${message}${Object.keys(rest).length ? ' ' + JSON.stringify(rest) : ''}`)),
  transports: [new winston.transports.Console({ silent: env.NODE_ENV === 'test' })],
});
