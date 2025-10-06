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

export interface CreateOrganizationRequest {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  description?: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  description?: string;
  is_active?: boolean;
}

const organizationServiceInternal = {
  async register(data: CreateOrganizationRequest): Promise<ApiHandlerResult<Organization>> {
    const responsePromise = apiClient.post(API_CONFIG.ENDPOINTS.ORGANIZATIONS.REGISTER, data);
    return handleApiResponse<Organization>(responsePromise);
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
};