/**
 * SERVICIO del frontend para Ingredientes Sustitutos.
 *
 * Concentra TODAS las llamadas HTTP de sustitutos en un solo lugar. Los componentes
 * no manipulan fetch ni URLs directamente: llaman a `substituteIngredientService.getAll(...)`, etc.
 * Reutiliza `request` de ./http para estandarizar el manejo de errores.
 */
import type { SustitutoApi, SustitutoFormData } from '../types';
import { API_BASE, JSON_HEADERS, authHeaders, request } from './http';

const getUrl = (ingredientId: number) => `${API_BASE}/ingredients/${ingredientId}/substitutes`;

export const substituteIngredientService = {
    // GET    /api/ingredients/:ingredientId/substitutes      → lista los sustitutos del ingrediente
    getAll: (ingredientId: number) => request<SustitutoApi[]>(getUrl(ingredientId)),

    // POST   /api/ingredients/:ingredientId/substitutes      → crea un sustituto para el ingrediente
    create: (ingredientId: number, data: Omit<SustitutoFormData, 'ingredientePrincipalId'>) =>
        request<SustitutoApi>(getUrl(ingredientId), { method: 'POST', headers: authHeaders(JSON_HEADERS), body: JSON.stringify(data) }),

    // PUT    /api/ingredients/:ingredientId/substitutes/:id  → modifica un sustituto existente
    update: (ingredientId: number, id: number, data: Omit<SustitutoFormData, 'ingredientePrincipalId'>) =>
        request<SustitutoApi>(`${getUrl(ingredientId)}/${id}`, { method: 'PUT', headers: authHeaders(JSON_HEADERS), body: JSON.stringify(data) }),

    // DELETE /api/ingredients/:ingredientId/substitutes/:id  → elimina un sustituto
    remove: (ingredientId: number, id: number) => request<void>(`${getUrl(ingredientId)}/${id}`, { method: 'DELETE', headers: authHeaders() }),
};
