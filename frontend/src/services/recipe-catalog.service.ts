import { API_BASE, JSON_HEADERS, authHeaders, request } from './http';

export interface OriginApi {
  idOrigin: number;
  nombre: string;
  pais: string;
}

export interface DifficultyApi {
  idDifficulty: number;
  nivel: string;
}

export const recipeCatalogService = {
  getOrigins: () => request<OriginApi[]>(`${API_BASE}/origins`),
  getDifficulties: () => request<DifficultyApi[]>(`${API_BASE}/difficulties`),
  createOrigin: (data: Omit<OriginApi, 'idOrigin'>) => request<OriginApi>(`${API_BASE}/origins`, {
    method: 'POST', headers: authHeaders(JSON_HEADERS), body: JSON.stringify(data),
  }),
  updateOrigin: (id: number, data: Omit<OriginApi, 'idOrigin'>) => request<void>(`${API_BASE}/origins/${id}`, {
    method: 'PUT', headers: authHeaders(JSON_HEADERS), body: JSON.stringify(data),
  }),
  deleteOrigin: (id: number) => request<void>(`${API_BASE}/origins/${id}`, { method: 'DELETE', headers: authHeaders() }),
  createDifficulty: (nivel: string) => request<DifficultyApi>(`${API_BASE}/difficulties`, {
    method: 'POST', headers: authHeaders(JSON_HEADERS), body: JSON.stringify({ nivel }),
  }),
  updateDifficulty: (id: number, nivel: string) => request<void>(`${API_BASE}/difficulties/${id}`, {
    method: 'PUT', headers: authHeaders(JSON_HEADERS), body: JSON.stringify({ nivel }),
  }),
  deleteDifficulty: (id: number) => request<void>(`${API_BASE}/difficulties/${id}`, { method: 'DELETE', headers: authHeaders() }),
};
