import winston from 'winston';
import { config } from '@/config/app';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${message}${stack ? `\n${stack}` : ''}`;
  })
);

export const logger = winston.createLogger({
  level: config.nodeEnv === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: '123hansa-api' },
  transports: [
    new winston.transports.Console({
      format: logFormat,
    }),
  ],
});

// Add file logging in production
if (config.nodeEnv === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.json(),
    })
  );
  
  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.json(),
    })
  );
}