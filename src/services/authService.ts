import { apiClient } from '@/lib/api/apiClient';
import { API_CONFIG } from '@/config/api.config';

export interface LoginResponse {
  token: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const url = '/api/auth/login';
    const resp = await apiClient.post(url, { email, password });
    return resp.data as LoginResponse;
  }
};
