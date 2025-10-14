import { apiClient } from '@/lib/api/apiClient';
import { API_CONFIG } from '@/config/api.config';
import { handleApiResponse } from '@/lib/api/apiResponseHandler';
import { ApiHandlerResult } from '@/types/api';
import { Offer } from '@/types/api';

const offerServiceInternal = {
  async create(offer: Partial<Offer>, orgID: number): Promise<ApiHandlerResult<Offer>> {
    // orgID is expected as query param per backend handlers
    const responsePromise = apiClient.post(API_CONFIG.ENDPOINTS.ORGANIZATIONS.OFFERS.CREATE + `?orgID=${orgID}`, offer);
    return handleApiResponse<Offer>(responsePromise);
  },

  async update(id: number, offer: Partial<Offer>, orgID: number): Promise<ApiHandlerResult<Offer>> {
    const responsePromise = apiClient.put(API_CONFIG.ENDPOINTS.ORGANIZATIONS.OFFERS.UPDATE(id) + `?orgID=${orgID}`, offer);
    return handleApiResponse<Offer>(responsePromise);
  },

  async sendToApproval(id: number, orgID: number): Promise<ApiHandlerResult<Offer>> {
    const responsePromise = apiClient.post(API_CONFIG.ENDPOINTS.ORGANIZATIONS.OFFERS.SEND_TO_APPROVAL(id) + `?orgID=${orgID}`);
    return handleApiResponse<Offer>(responsePromise);
  },

  async get(id: number): Promise<ApiHandlerResult<Offer>> {
    const responsePromise = apiClient.get(API_CONFIG.ENDPOINTS.ORGANIZATIONS.OFFERS.GET(id));
    return handleApiResponse<Offer>(responsePromise);
  },

  async delete(id: number, orgID: number): Promise<ApiHandlerResult<null>> {
    const responsePromise = apiClient.delete(API_CONFIG.ENDPOINTS.ORGANIZATIONS.OFFERS.DELETE(id) + `?orgID=${orgID}`);
    return handleApiResponse<null>(responsePromise);
  },

  async list(orgID: number, status?: string): Promise<ApiHandlerResult<Offer[]>> {
    const url = new URL(API_CONFIG.ENDPOINTS.ORGANIZATIONS.OFFERS.LIST, API_CONFIG.BASE_URL);
    url.searchParams.append('orgID', String(orgID));
    if (status) url.searchParams.append('status', status);
    const responsePromise = apiClient.get(url.toString());
    return handleApiResponse<Offer[]>(responsePromise);
  }
};

export const offerService = {
  async create(offer: Partial<Offer>, orgID: number) {
    const result = await offerServiceInternal.create(offer, orgID);
    if (!result.success) throw new Error(result.message);
    if (!result.data) throw new Error('No data from create offer');
    return result.data;
  },

  async update(id: number, offer: Partial<Offer>, orgID: number) {
    const result = await offerServiceInternal.update(id, offer, orgID);
    if (!result.success) throw new Error(result.message);
    if (!result.data) throw new Error('No data from update offer');
    return result.data;
  },

  async sendToApproval(id: number, orgID: number) {
    const result = await offerServiceInternal.sendToApproval(id, orgID);
    if (!result.success) throw new Error(result.message);
    if (!result.data) throw new Error('No data from send to approval');
    return result.data;
  },

  async get(id: number) {
    const result = await offerServiceInternal.get(id);
    if (!result.success) throw new Error(result.message);
    if (!result.data) throw new Error('Offer not found');
    return result.data;
  },

  async delete(id: number, orgID: number) {
    const result = await offerServiceInternal.delete(id, orgID);
    if (!result.success) throw new Error(result.message);
    return true;
  },

  async list(orgID: number, status?: string) {
    const result = await offerServiceInternal.list(orgID, status);
    if (!result.success) throw new Error(result.message);
    return result.data || [];
  }
};
