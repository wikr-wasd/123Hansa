import { createError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { config } from '@/config/app';
import { prisma } from '@/config/database';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination?: string;
  filename?: string;
  path?: string;
  buffer?: Buffer;
}

export class FileService {
  private static uploadDir = path.join(process.cwd(), 'uploads');
  private static imagesDir = path.join(this.uploadDir, 'images');
  private static documentsDir = path.join(this.uploadDir, 'documents');
  private static thumbnailsDir = path.join(this.uploadDir, 'thumbnails');

  /**
   * Initialize upload directories
   */
  static async initializeDirectories() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      await fs.mkdir(this.imagesDir, { recursive: true });
      await fs.mkdir(this.documentsDir, { recursive: true });
      await fs.mkdir(this.thumbnailsDir, { recursive: true });
      logger.info('Upload directories initialized');
    } catch (error) {
      logger.error('Failed to initialize upload directories:', error);
      throw error;
    }
  }

  /**
   * Validate file type and size
   */
  static validateFile(file: UploadedFile, type: 'image' | 'document'): void {
    const maxSize = config.maxFileSize;

    if (file.size > maxSize) {
      throw createError.badRequest(`File size too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
    }

    if (type === 'image') {
      const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif'
      ];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw createError.badRequest('Invalid image type. Allowed: JPEG, PNG, WebP, GIF');
      }
    } else if (type === 'document') {
      const allowedMimeTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv'
      ];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw createError.badRequest('Invalid document type. Allowed: PDF, DOC, DOCX, XLS, XLSX, TXT, CSV');
      }
    }
  }

  /**
   * Upload and process image
   */
  static async uploadImage(file: UploadedFile, listingId: string, isMain: boolean = false): Promise<any> {
    try {
      this.validateFile(file, 'image');

      const fileId = uuidv4();
      const extension = path.extname(file.originalname);
      const filename = `${fileId}${extension}`;
      const filePath = path.join(this.imagesDir, filename);

      // Save original image
      if (file.buffer) {
        await fs.writeFile(filePath, file.buffer);
      } else if (file.path) {
        await fs.copyFile(file.path, filePath);
      } else {
        throw createError.badRequest('Invalid file data');
      }

      // Generate thumbnail
      const thumbnailFilename = `thumb_${filename}`;
      const thumbnailPath = path.join(this.thumbnailsDir, thumbnailFilename);
      
      await sharp(filePath)
        .resize(300, 200, { 
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);

      // Generate optimized version
      const optimizedFilename = `opt_${filename}`;
      const optimizedPath = path.join(this.imagesDir, optimizedFilename);
      
      await sharp(filePath)
        .resize(1200, 800, { 
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 85 })
        .toFile(optimizedPath);

      // Get next order number
      const lastImage = await prisma.listingImage.findFirst({
        where: { listingId },
        orderBy: { order: 'desc' },
        select: { order: true },
      });

      const order = lastImage ? lastImage.order + 1 : 0;

      // Save to database
      const imageRecord = await prisma.listingImage.create({
        data: {
          listingId,
          filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url: `/uploads/images/${filename}`,
          isMain,
          order,
        },
      });

      logger.info(`Image uploaded: ${filename} for listing: ${listingId}`);
      return imageRecord;
    } catch (error) {
      logger.error('Upload image error:', error);
      throw error;
    }
  }

  /**
   * Upload document
   */
  static async uploadDocument(
    file: UploadedFile, 
    listingId: string, 
    documentType: string = 'general',
    isPublic: boolean = false
  ): Promise<any> {
    try {
      this.validateFile(file, 'document');

      const fileId = uuidv4();
      const extension = path.extname(file.originalname);
      const filename = `${fileId}${extension}`;
      const filePath = path.join(this.documentsDir, filename);

      // Save document
      if (file.buffer) {
        await fs.writeFile(filePath, file.buffer);
      } else if (file.path) {
        await fs.copyFile(file.path, filePath);
      } else {
        throw createError.badRequest('Invalid file data');
      }

      // Save to database
      const documentRecord = await prisma.listingDocument.create({
        data: {
          listingId,
          filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url: `/uploads/documents/${filename}`,
          documentType,
          isPublic,
        },
      });

      logger.info(`Document uploaded: ${filename} for listing: ${listingId}`);
      return documentRecord;
    } catch (error) {
      logger.error('Upload document error:', error);
      throw error;
    }
  }

  /**
   * Delete file
   */
  static async deleteFile(fileId: string, type: 'image' | 'document', userId: string): Promise<void> {
    try {
      let record: any;
      let filePath: string;

      if (type === 'image') {
        record = await prisma.listingImage.findUnique({
          where: { id: fileId },
          include: {
            listing: {
              select: { userId: true },
            },
          },
        });

        if (!record) {
          throw createError.notFound('Image not found');
        }

        if (record.listing.userId !== userId) {
          throw createError.forbidden('You can only delete your own files');
        }

        filePath = path.join(this.imagesDir, record.filename);
        
        // Delete thumbnail and optimized versions
        const thumbnailPath = path.join(this.thumbnailsDir, `thumb_${record.filename}`);
        const optimizedPath = path.join(this.imagesDir, `opt_${record.filename}`);
        
        await Promise.all([
          fs.unlink(filePath).catch(() => {}),
          fs.unlink(thumbnailPath).catch(() => {}),
          fs.unlink(optimizedPath).catch(() => {}),
        ]);

        await prisma.listingImage.delete({
          where: { id: fileId },
        });
      } else {
        record = await prisma.listingDocument.findUnique({
          where: { id: fileId },
          include: {
            listing: {
              select: { userId: true },
            },
          },
        });

        if (!record) {
          throw createError.notFound('Document not found');
        }

        if (record.listing.userId !== userId) {
          throw createError.forbidden('You can only delete your own files');
        }

        filePath = path.join(this.documentsDir, record.filename);
        
        await fs.unlink(filePath).catch(() => {});

        await prisma.listingDocument.delete({
          where: { id: fileId },
        });
      }

      logger.info(`File deleted: ${record.filename}`);
    } catch (error) {
      logger.error('Delete file error:', error);
      throw error;
    }
  }

  /**
   * Set main image
   */
  static async setMainImage(imageId: string, userId: string): Promise<void> {
    try {
      const image = await prisma.listingImage.findUnique({
        where: { id: imageId },
        include: {
          listing: {
            select: { userId: true },
          },
        },
      });

      if (!image) {
        throw createError.notFound('Image not found');
      }

      if (image.listing.userId !== userId) {
        throw createError.forbidden('You can only modify your own listings');
      }

      // Remove main flag from other images
      await prisma.listingImage.updateMany({
        where: { 
          listingId: image.listingId,
          id: { not: imageId },
        },
        data: { isMain: false },
      });

      // Set this image as main
      await prisma.listingImage.update({
        where: { id: imageId },
        data: { isMain: true },
      });

      logger.info(`Main image set: ${imageId}`);
    } catch (error) {
      logger.error('Set main image error:', error);
      throw error;
    }
  }

  /**
   * Reorder images
   */
  static async reorderImages(listingId: string, imageIds: string[], userId: string): Promise<void> {
    try {
      const listing = await prisma.businessListing.findUnique({
        where: { id: listingId },
        select: { userId: true },
      });

      if (!listing) {
        throw createError.notFound('Listing not found');
      }

      if (listing.userId !== userId) {
        throw createError.forbidden('You can only modify your own listings');
      }

      // Update order for each image
      const updatePromises = imageIds.map((imageId, index) =>
        prisma.listingImage.update({
          where: { id: imageId, listingId },
          data: { order: index },
        })
      );

      await Promise.all(updatePromises);

      logger.info(`Images reordered for listing: ${listingId}`);
    } catch (error) {
      logger.error('Reorder images error:', error);
      throw error;
    }
  }

  /**
   * Get file URL
   */
  static getFileUrl(filename: string, type: 'image' | 'document' | 'thumbnail'): string {
    if (config.storageProvider === 'local') {
      return `/uploads/${type === 'thumbnail' ? 'thumbnails' : type === 'image' ? 'images' : 'documents'}/${filename}`;
    }
    // TODO: Implement S3 URL generation
    return filename;
  }
}