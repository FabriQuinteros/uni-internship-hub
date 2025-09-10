import api from './api';
import { Catalog } from '../types/catalog';

export const getCatalogs = async (): Promise<Catalog[]> => {
    const response = await api.get('/catalogs');
    return response.data;
};

export const getCatalogById = async (id: string): Promise<Catalog> => {
    const response = await api.get(`/catalogs/${id}`);
    return response.data;
};

export const createCatalog = async (catalog: Catalog): Promise<Catalog> => {
    const response = await api.post('/catalogs', catalog);
    return response.data;
};

export const updateCatalog = async (id: string, catalog: Catalog): Promise<Catalog> => {
    const response = await api.put(`/catalogs/${id}`, catalog);
    return response.data;
};

export const deleteCatalog = async (id: string): Promise<void> => {
    await api.delete(`/catalogs/${id}`);
};