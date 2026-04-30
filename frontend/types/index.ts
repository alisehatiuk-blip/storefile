export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  role: 'user' | 'admin' | 'super_admin';
  isEmailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText?: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ProductFile {
  id: string;
  version?: string;
  fileName: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  features: string[];
  price: string;
  supportPrice?: string;
  status: 'draft' | 'published' | 'archived';
  demoUrl?: string;
  version: string;
  tags: string[];
  downloadCount: number;
  viewCount: number;
  rating?: string;
  ratingCount: number;
  metaTitle?: string;
  metaDescription?: string;
  images: ProductImage[];
  categories: Category[];
  files?: ProductFile[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productTitle: string;
  price: string;
  includesSupport: boolean;
  supportPrice?: string;
  supportExpiresAt?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  totalAmount: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentReference?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface License {
  id: string;
  licenseKey: string;
  userId: string;
  productId: string;
  orderId: string;
  status: 'active' | 'expired' | 'revoked';
  expiresAt?: string;
  activatedAt?: string;
  createdAt: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderRole: 'user' | 'admin';
  message: string;
  attachmentUrl?: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  userId: string;
  productId?: string;
  orderId?: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  closedAt?: string;
  messages?: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
