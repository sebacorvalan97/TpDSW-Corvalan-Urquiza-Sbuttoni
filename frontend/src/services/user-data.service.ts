import { API_BASE, JSON_HEADERS, authHeaders, request } from './http';

const DATA_URL = `${API_BASE}/user-data`;

export interface CommentApi {
  id: number;
  recipeDishId: number;
  userId: number;
  userName: string;
  avatar: string;
  rating: number;
  text: string;
  date: string;
  likes: number;
  likedByUser: boolean;
}

export interface PantryItemApi {
  idIngredient: number;
  nombre: string;
  unidadMedidaDefecto: string;
  cantidad: number;
  unidad: string;
}

export interface SubstituteApi {
  id: string;
  ingredientId: number;
  ingredientName: string;
  substituteId: number;
  substituteName: string;
  proportion: string;
  notes: string;
}

export const userDataService = {
  getFavorites: () => request<number[]>(`${DATA_URL}/favorites`, { headers: authHeaders() }),
  toggleFavorite: (recipeId: number) => request<{ isFavorite: boolean }>(`${DATA_URL}/favorites/${recipeId}`, {
    method: 'POST',
    headers: authHeaders(),
  }),
  getComments: (recipeId: number) => request<CommentApi[]>(`${API_BASE}/recipes/${recipeId}/comments`, { headers: authHeaders() }),
  createComment: (recipeId: number, rating: number, text: string) =>
    request<CommentApi>(`${API_BASE}/recipes/${recipeId}/comments`, {
      method: 'POST',
      headers: authHeaders(JSON_HEADERS),
      body: JSON.stringify({ rating, text }),
    }),
  toggleCommentLike: (commentId: number) =>
    request<CommentApi>(`${API_BASE}/comments/${commentId}/like`, { method: 'POST', headers: authHeaders() }),

  getPantry: () => request<PantryItemApi[]>(`${DATA_URL}/pantry`, { headers: authHeaders() }),
  setPantryItem: (ingredientId: number, cantidad: number, unidad: string) =>
    request<PantryItemApi[]>(`${DATA_URL}/pantry`, {
      method: 'PUT',
      headers: authHeaders(JSON_HEADERS),
      body: JSON.stringify({ ingredientId, cantidad, unidad }),
    }),
  removePantryItem: (ingredientId: number) =>
    request<void>(`${DATA_URL}/pantry/${ingredientId}`, { method: 'DELETE', headers: authHeaders() }),

  getSubstitutes: () => request<SubstituteApi[]>(`${DATA_URL}/substitutes`),
  createSubstitute: (ingredientId: number, substituteId: number, proportion: string, notes: string) =>
    request<SubstituteApi>(`${DATA_URL}/substitutes`, {
      method: 'POST',
      headers: authHeaders(JSON_HEADERS),
      body: JSON.stringify({ ingredientId, substituteId, proportion, notes }),
    }),
  deleteSubstitute: (ingredientId: number, substituteId: number) =>
    request<void>(`${DATA_URL}/substitutes/${ingredientId}/${substituteId}`, { method: 'DELETE', headers: authHeaders() }),
};
