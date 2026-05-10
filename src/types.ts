export interface BusinessProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  ownerId: string;
  createdAt: any;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  unitPrice: number;
  category?: string;
  ownerId: string;
}

export interface EstimateItem {
  serviceId?: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Estimate {
  id: string;
  estimateNumber: string;
  clientId: string;
  clientName: string;
  items: EstimateItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  notes?: string;
  expiryDate?: string;
  createdAt: any;
  updatedAt: any;
  ownerId: string;
}
