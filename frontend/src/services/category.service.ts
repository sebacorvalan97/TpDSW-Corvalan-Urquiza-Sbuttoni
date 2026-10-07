/**
 * SERVICIO del frontend para Categorías.
 *
 * Concentra TODAS las llamadas HTTP de categorías en un solo lugar. Así los componentes
 * no saben nada de fetch/URLs: solo llaman a `categoryService.getAll()`, etc.
 * (Es el "servicio" que pide la cátedra para el frontend.)
 */
import type { CategoriaApi, CategoriaFormData } from '../types';
import { API_BASE, JSON_HEADERS, request } from './http';

const API_URL = `${API_BASE}/categories`;

export const categoryService = {
    getAll: () => request<CategoriaApi[]>(API_URL),

    create: (data: CategoriaFormData) =>
        request<CategoriaApi>(API_URL, { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(data) }),

    update: (id: number, data: CategoriaFormData) =>
        request<CategoriaApi>(`${API_URL}/${id}`, { method: 'PUT', headers: JSON_HEADERS, body: JSON.stringify(data) }),

    remove: (id: number) => request<void>(`${API_URL}/${id}`, { method: 'DELETE' }),
};
