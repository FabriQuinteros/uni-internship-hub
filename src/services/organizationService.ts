import { apiClient } from '@/lib/api/apiClient';
import { API_CONFIG } from '@/config/api.config';
import { handleApiResponse } from '@/lib/api/apiResponseHandler';
import { ApiHandlerResult } from '@/types/api';

export interface Organization {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizationProfile {
  id: number;
  userId: number;
  businessName: string;
  industry?: string;
  address?: string;
  website?: string;
  description?: string;
  mainContact: string;
  logoUrl?: string;
  agreementStatus?: 'active' | 'inactive';
  agreementExpiry?: string | null;
  createdAt?: string;
}

export interface CreateOrganizationRequest {
  email: string;
  password: string;
  companyName: string;
  industry: string;
  website?: string;
  description?: string;
  address?: string;
  contactName?: string;
  contactPhone?: string;
}

export interface UpdateOrganizationRequest {
  // This interface represents fields allowed by the organization profile update endpoint
  businessName?: string;
  industry?: string;
  address?: string;
  website?: string;
  description?: string;
  mainContact?: string;
  logoUrl?: string;
  agreementStatus?: 'active' | 'inactive';
  agreementExpiry?: string; // YYYY-MM-DD
}

const organizationServiceInternal = {
  async register(data: CreateOrganizationRequest): Promise<ApiHandlerResult<Organization>> {
    const responsePromise = apiClient.post(API_CONFIG.ENDPOINTS.ORGANIZATIONS.REGISTER, data);
    return handleApiResponse<Organization>(responsePromise);
  }
  ,
  async getProfile(userId?: number) : Promise<ApiHandlerResult<OrganizationProfile>> {
    // The backend accepts userID via query or context; we'll call with userID if provided
    const url = API_CONFIG.ENDPOINTS.ORGANIZATIONS.PROFILE.GET;
    const responsePromise = apiClient.get(userId ? `${url}?userID=${userId}` : url);
    return handleApiResponse<OrganizationProfile>(responsePromise);
  },
  async update(userId: number | undefined, data: UpdateOrganizationRequest): Promise<ApiHandlerResult<OrganizationProfile>> {
    const url = API_CONFIG.ENDPOINTS.ORGANIZATIONS.PROFILE.UPDATE;
    const target = userId ? `${url}?userID=${userId}` : url;
    const responsePromise = apiClient.put(target, data);
    return handleApiResponse<OrganizationProfile>(responsePromise);
  }
};

export const organizationService = {
  async register(data: CreateOrganizationRequest): Promise<Organization> {
    const result = await organizationServiceInternal.register(data);
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    if (!result.data) {
      throw new Error('No data returned from registration');
    }
    
    return result.data;
  }
  ,
  async getProfile(userId?: number): Promise<OrganizationProfile> {
    const result = await organizationServiceInternal.getProfile(userId);
    if (!result.success) throw new Error(result.message);
    if (!result.data) throw new Error('No data returned from getProfile');
    return result.data;
  },
  async update(userId: number | undefined, data: UpdateOrganizationRequest): Promise<OrganizationProfile> {
    const result = await organizationServiceInternal.update(userId, data);
    if (!result.success) throw new Error(result.message);
    if (!result.data) throw new Error('No data returned from update');
    return result.data;
  }
};