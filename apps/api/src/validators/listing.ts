import { z } from 'zod';

// Business listing categories
export const listingCategorySchema = z.enum([
  'BUSINESS',
  'ECOMMERCE', 
  'SAAS',
  'WEBSITE',
  'DOMAIN',
  'INVOICE',
  'REAL_ESTATE',
  'EQUIPMENT',
  'OTHER'
]);

// Nordic business types
export const businessTypeSchema = z.enum([
  'AB',        // Aktiebolag (Sweden)
  'AS',        // Aksjeselskap (Norway) 
  'A_S',       // Aktieselskab (Denmark)
  'SOLE_PROP', // Sole Proprietorship
  'PARTNER',   // Partnership
  'OTHER'
]);

// Listing status
export const listingStatusSchema = z.enum([
  'DRAFT',
  'PENDING_REVIEW',
  'ACTIVE', 
  'SOLD',
  'EXPIRED',
  'REMOVED'
]);

// Currency validation
export const currencySchema = z.enum(['SEK', 'NOK', 'DKK', 'EUR', 'USD']).default('SEK');

// Create listing validation schema
export const createListingSchema = z.object({
  title: z.string()
    .min(10, 'Title must be at least 10 characters')
    .max(100, 'Title must be less than 100 characters')
    .regex(/^[a-zA-ZäöåÄÖÅæøÆØéÉüÜ0-9\s\-.,!&]+$/, 'Title contains invalid characters'),
  
  description: z.string()
    .min(50, 'Description must be at least 50 characters')
    .max(5000, 'Description must be less than 5000 characters')
    .optional(),
    
  shortDescription: z.string()
    .min(20, 'Short description must be at least 20 characters')
    .max(200, 'Short description must be less than 200 characters')
    .optional(),
    
  category: listingCategorySchema,
  
  subcategory: z.string()
    .min(2, 'Subcategory must be at least 2 characters')
    .max(50, 'Subcategory must be less than 50 characters')
    .optional(),
    
  businessType: businessTypeSchema.optional(),
  
  askingPrice: z.number()
    .min(1000, 'Asking price must be at least 1,000')
    .max(1000000000, 'Asking price must be less than 1 billion')
    .optional(),
    
  currency: currencySchema,
  
  isNegotiable: z.boolean().default(true),
  
  monthlyRevenue: z.number()
    .min(0, 'Monthly revenue cannot be negative')
    .max(100000000, 'Monthly revenue must be less than 100 million')
    .optional(),
    
  monthlyProfit: z.number()
    .min(-1000000, 'Monthly profit cannot be less than -1 million')
    .max(100000000, 'Monthly profit must be less than 100 million')
    .optional(),
    
  employees: z.number()
    .int('Employees must be a whole number')
    .min(0, 'Employees cannot be negative')
    .max(100000, 'Employees must be less than 100,000')
    .optional(),
    
  establishedYear: z.number()
    .int('Established year must be a whole number')
    .min(1800, 'Established year must be after 1800')
    .max(new Date().getFullYear(), 'Established year cannot be in the future')
    .optional(),
    
  website: z.string()
    .url('Invalid website URL')
    .optional()
    .or(z.literal('')),
    
  location: z.string()
    .min(2, 'Location must be at least 2 characters')
    .max(100, 'Location must be less than 100 characters')
    .optional(),
    
  isRemote: z.boolean().default(false),
  
  reasonForSale: z.string()
    .min(10, 'Reason for sale must be at least 10 characters')
    .max(1000, 'Reason for sale must be less than 1000 characters')
    .optional(),
    
  includedAssets: z.array(z.string().min(1).max(100))
    .max(20, 'Cannot include more than 20 assets')
    .default([]),
});

// Update listing validation schema
export const updateListingSchema = createListingSchema.partial().extend({
  status: listingStatusSchema.optional(),
});

// Search listings validation schema
export const searchListingsSchema = z.object({
  query: z.string()
    .max(100, 'Search query must be less than 100 characters')
    .optional(),
    
  category: listingCategorySchema.optional(),
  
  businessType: businessTypeSchema.optional(),
  
  country: z.enum(['SE', 'NO', 'DK']).optional(),
  
  minPrice: z.number()
    .min(0, 'Minimum price cannot be negative')
    .optional(),
    
  maxPrice: z.number()
    .min(0, 'Maximum price cannot be negative')
    .optional(),
    
  currency: currencySchema.optional(),
  
  isRemote: z.boolean().optional(),
  
  sortBy: z.enum(['createdAt', 'newest', 'askingPrice', 'monthlyRevenue', 'viewCount', 'inquiryCount'])
    .default('createdAt'),
    
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  
  page: z.number()
    .int('Page must be a whole number')
    .min(1, 'Page must be at least 1')
    .default(1),
    
  limit: z.number()
    .int('Limit must be a whole number')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot be more than 100')
    .default(20),
}).refine(data => {
  if (data.minPrice && data.maxPrice) {
    return data.minPrice <= data.maxPrice;
  }
  return true;
}, {
  message: 'Minimum price cannot be greater than maximum price',
  path: ['minPrice'],
});

// File upload validation
export const fileUploadSchema = z.object({
  files: z.array(z.object({
    filename: z.string().min(1),
    originalName: z.string().min(1),
    mimeType: z.string().min(1),
    size: z.number().min(1).max(50 * 1024 * 1024), // 50MB max
  })).max(20, 'Cannot upload more than 20 files'),
  
  type: z.enum(['image', 'document']),
});

// Categories with subcategories
export const categoryOptions = {
  BUSINESS: [
    'Restaurant & Food Service',
    'Retail Store',
    'Manufacturing',
    'Consulting',
    'Healthcare',
    'Beauty & Wellness',
    'Automotive',
    'Construction',
    'Professional Services',
    'Other Business'
  ],
  ECOMMERCE: [
    'Fashion & Apparel',
    'Electronics',
    'Home & Garden',
    'Health & Beauty',
    'Sports & Outdoors',
    'Books & Media',
    'Handmade & Crafts',
    'Digital Products',
    'Dropshipping',
    'Other E-commerce'
  ],
  SAAS: [
    'CRM Software',
    'Marketing Tools',
    'Analytics Platform',
    'Productivity App',
    'Communication Tool',
    'E-learning Platform',
    'Project Management',
    'Accounting Software',
    'HR Software',
    'Other SaaS'
  ],
  WEBSITE: [
    'Blog & Content Site',
    'News & Media',
    'Community Forum',
    'Portfolio Site',
    'Directory Site',
    'Review Site',
    'Job Board',
    'Dating Site',
    'Gaming Site',
    'Other Website'
  ],
  DOMAIN: [
    'Premium Domain',
    'Aged Domain',
    'Keyword Domain',
    'Brand Domain',
    'Geographic Domain',
    'Industry Domain',
    'Other Domain'
  ],
  INVOICE: [
    'B2B Invoices',
    'B2C Invoices',
    'Government Invoices',
    'Healthcare Invoices',
    'Construction Invoices',
    'Professional Services',
    'Other Invoices'
  ],
  REAL_ESTATE: [
    'Office Space',
    'Retail Space',
    'Warehouse',
    'Industrial Property',
    'Restaurant Space',
    'Medical Facility',
    'Mixed Use',
    'Land',
    'Other Commercial'
  ],
  EQUIPMENT: [
    'Manufacturing Equipment',
    'Office Equipment',
    'Restaurant Equipment',
    'Medical Equipment',
    'Construction Equipment',
    'IT Equipment',
    'Vehicles',
    'Other Equipment'
  ],
  OTHER: [
    'Intellectual Property',
    'Licenses & Permits',
    'Inventory Stock',
    'Customer Database',
    'Social Media Account',
    'Other Asset'
  ]
} as const;

// Type exports
export type CreateListingRequest = z.infer<typeof createListingSchema>;
export type UpdateListingRequest = z.infer<typeof updateListingSchema>;
export type SearchListingsRequest = z.infer<typeof searchListingsSchema>;
export type FileUploadRequest = z.infer<typeof fileUploadSchema>;
export type ListingCategory = z.infer<typeof listingCategorySchema>;
export type BusinessType = z.infer<typeof businessTypeSchema>;
export type ListingStatus = z.infer<typeof listingStatusSchema>;