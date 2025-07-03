import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { logger } from '@/utils/logger';
import { config } from '@/config/app';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: string;
}

export class CustomError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: AppError | ZodError | Prisma.PrismaClientKnownRequestError | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details: any = undefined;

  // Zod validation errors
  if (error instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    details = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));
  }
  
  // Prisma database errors
  else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400;
    
    switch (error.code) {
      case 'P2002':
        message = 'Record already exists';
        const target = error.meta?.target as string[];
        details = {
          field: target?.[0] || 'unknown',
          constraint: 'unique_violation',
        };
        break;
      case 'P2025':
        message = 'Record not found';
        statusCode = 404;
        break;
      case 'P2003':
        message = 'Foreign key constraint failed';
        break;
      case 'P2014':
        message = 'Invalid relation';
        break;
      default:
        message = 'Database error';
        logger.error('Unhandled Prisma error:', { code: error.code, meta: error.meta });
    }
  }
  
  // Custom application errors
  else if (error instanceof CustomError) {
    statusCode = error.statusCode;
    message = error.message;
  }
  
  // JWT errors
  else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }
  
  // Multer file upload errors
  else if (error.name === 'MulterError') {
    statusCode = 400;
    message = 'File upload error';
    details = { code: (error as any).code };
  }

  // Log error details
  logger.error('Error handled:', {
    message: error.message,
    statusCode,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Send error response
  const errorResponse: any = {
    error: true,
    message,
    timestamp: new Date().toISOString(),
    path: req.path,
  };

  if (details) {
    errorResponse.details = details;
  }

  // Include stack trace in development
  if (config.nodeEnv === 'development') {
    errorResponse.stack = error.stack;
  }

  res.status(statusCode).json(errorResponse);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Common error creators
export const createError = {
  badRequest: (message: string = 'Bad Request') => new CustomError(message, 400),
  unauthorized: (message: string = 'Unauthorized') => new CustomError(message, 401),
  forbidden: (message: string = 'Forbidden') => new CustomError(message, 403),
  notFound: (message: string = 'Not Found') => new CustomError(message, 404),
  conflict: (message: string = 'Conflict') => new CustomError(message, 409),
  tooManyRequests: (message: string = 'Too Many Requests') => new CustomError(message, 429),
  internal: (message: string = 'Internal Server Error') => new CustomError(message, 500),
};