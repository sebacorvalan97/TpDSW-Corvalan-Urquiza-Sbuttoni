/**
 * SERVICIO del frontend para Ingredientes.
 *
 * Concentra TODAS las llamadas HTTP de ingredientes en un solo lugar. Los componentes
 * no saben nada de fetch/URLs: solo llaman a `ingredientService.getAll()`, etc.
 * Reutiliza `request` de ./http para no repetir el manejo de errores.
 */
import type { IngredienteApi, IngredienteFormData } from '../types';
import { API_BASE, JSON_HEADERS, request } from './http';

const API_URL = `${API_BASE}/ingredients`;

export const ingredientService = {
    // GET    /api/ingredients      → lista
    getAll: () => request<IngredienteApi[]>(API_URL),

    // POST   /api/ingredients      → crea (el body viaja como JSON)
    create: (data: IngredienteFormData) =>
        request<IngredienteApi>(API_URL, { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(data) }),

    // PUT    /api/ingredients/:id  → modifica
    update: (id: number, data: IngredienteFormData) =>
        request<IngredienteApi>(`${API_URL}/${id}`, { method: 'PUT', headers: JSON_HEADERS, body: JSON.stringify(data) }),

    // DELETE /api/ingredients/:id  → elimina
    remove: (id: number) => request<void>(`${API_URL}/${id}`, { method: 'DELETE' }),
};
//ah¿ghrego algo como para ver que pasa que cande no peude ver mis archivos de front  