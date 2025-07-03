import multer from 'multer';
import { Request } from 'express';
import { createError } from './errorHandler';
import { config } from '@/config/app';
import path from 'path';

// Configure storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Get file type from route or body
  const fileType = req.params.type || req.body.fileType || 'image';
  
  if (fileType === 'image') {
    // Allow images
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png', 
      'image/webp',
      'image/gif'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(createError.badRequest('Invalid image type. Allowed: JPEG, PNG, WebP, GIF'));
    }
  } else if (fileType === 'document') {
    // Allow documents
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(createError.badRequest('Invalid document type. Allowed: PDF, DOC, DOCX, XLS, XLSX, TXT, CSV'));
    }
  } else {
    cb(createError.badRequest('Invalid file type'));
  }
};

// Create multer upload middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.maxFileSize, // Max file size from config
    files: 20, // Max 20 files per upload
  },
});

// Export specific upload configurations
export const uploadSingle = (fieldName: string = 'file') => upload.single(fieldName);
export const uploadMultiple = (fieldName: string = 'files', maxCount: number = 10) => 
  upload.array(fieldName, maxCount);
export const uploadFields = (fields: { name: string; maxCount: number }[]) => 
  upload.fields(fields);

// Error handling middleware for multer
export const handleUploadError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large',
        message: `File size cannot exceed ${config.maxFileSize / 1024 / 1024}MB`,
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files',
        message: 'Cannot upload more than 20 files at once',
      });
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Unexpected file field',
        message: error.message,
      });
    }
  }
  
  next(error);
};