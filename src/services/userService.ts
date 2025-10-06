import { apiClient } from '@/lib/api/apiClient';
import { User } from '../types/user';

export const getUsers = async (): Promise<User[]> => {
    const response = await apiClient.get('/users');
    return response.data;
};

export const getUserById = async (id: string): Promise<User> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
};

export const createUser = async (user: User): Promise<User> => {
    const response = await apiClient.post('/users', user);
    return response.data;
};

export const updateUser = async (id: string, user: User): Promise<User> => {
    const response = await apiClient.put(`/users/${id}`, user);
    return response.data;
};

export const deleteUser = async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
};