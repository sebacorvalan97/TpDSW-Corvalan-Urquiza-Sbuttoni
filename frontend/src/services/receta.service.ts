import { API_BASE, JSON_HEADERS, authHeaders, request } from './http';

interface RecipeApiResponse {
  idRecipe: number;
  idDish: number;
  nombre: string;
  descripcion: string;
  duracion: string;
  createdByUserId: number | null;
  createdByName: string | null;
  imagenUrl: string;
  idCategory: number | null;
  idDifficulty: number | null;
  origins: Array<{ idOrigin: number; nombre: string; pais: string }>;
  ingredients: Array<{
    idIngredient: number;
    nombre: string;
    unidadMedidaDefecto: string;
    cantidad: number;
    unidad: string;
  }>;
  steps: Array<{ idStep: number; order: number; descripcion: string }>;
  ratingAverage: number;
  ratingCount: number;
}

export interface Receta {
  idRecipe: number;
  idReceta: number;
  nombre: string;
  descripcion: string;
  duracion: string;
  tiempoMinutos: number;
  createdByUserId: number | null;
  createdByName: string | null;
  imagenUrl: string;
  idDish: number;
  idCategory: number | null;
  idDifficulty: number | null;
  origins: RecipeApiResponse['origins'];
  ingredients: RecipeApiResponse['ingredients'];
  steps: RecipeApiResponse['steps'];
  ratingAverage: number;
  ratingCount: number;
}

export interface RecipeWriteData {
  nombre: string;
  descripcion: string;
  duracion: number;
  idCategory: number | null;
  idDifficulty: number | null;
  idOrigin: number | null;
  imagenUrl: string;
  ingredients: Array<{ idIngredient: number; cantidad: number; unidad: string }>;
  steps: string[];
}

const API_URL = `${API_BASE}/recipes`;

const parseMinutes = (durationStr: string | null | undefined): number => {
  if (!durationStr) return 0;
  const match = String(durationStr).match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
};

const normalizeRecipe = (recipe: RecipeApiResponse): Receta => ({
  ...recipe,
  idReceta: recipe.idRecipe,
  tiempoMinutos: parseMinutes(recipe.duracion),
});

const saveRecipe = (url: string, method: 'POST' | 'PUT', data: RecipeWriteData) =>
  request<RecipeApiResponse>(url, {
    method,
    headers: authHeaders(JSON_HEADERS),
    body: JSON.stringify({
      ...data,
      duracion: String(data.duracion),
    }),
  }).then(normalizeRecipe);

export const recetaService = {
  getAllRecetas: async () => (await request<RecipeApiResponse[]>(API_URL)).map(normalizeRecipe),

  getReceta: async (idRecipe: number) => normalizeRecipe(await request<RecipeApiResponse>(`${API_URL}/${idRecipe}`)),

  createComplete: (data: RecipeWriteData) => saveRecipe(API_URL, 'POST', data),

  updateComplete: (idRecipe: number, data: RecipeWriteData) =>
    saveRecipe(`${API_URL}/${idRecipe}`, 'PUT', data),

  async createReceta(nombre: string, descripcion: string, tiempoMinutos: number): Promise<Receta> {
    return normalizeRecipe(await request<RecipeApiResponse>(API_URL, {
      method: 'POST',
      headers: authHeaders(JSON_HEADERS),
      body: JSON.stringify({ nombre, descripcion: descripcion || nombre, duracion: String(tiempoMinutos) }),
    }));
  },

  async updateReceta(
    idRecipe: number,
    data: { nombre: string; descripcion: string; tiempoMinutos: number },
  ): Promise<Receta> {
    return normalizeRecipe(await request<RecipeApiResponse>(`${API_URL}/${idRecipe}`, {
      method: 'PUT',
      headers: authHeaders(JSON_HEADERS),
      body: JSON.stringify({ nombre: data.nombre, descripcion: data.descripcion || data.nombre, duracion: String(data.tiempoMinutos) }),
    }));
  },

  deleteReceta: (idRecipe: number) =>
    request<void>(`${API_URL}/${idRecipe}`, { method: 'DELETE', headers: authHeaders() }),
};
