import { RecetaIngrediente } from '../types';

const API_URL = 'http://localhost:8080/api/recipes-ingredientes';

export const recetaIngredienteService = {
  getByRecetaId: async (recetaId: number): Promise<RecetaIngrediente[]> => {
    const response = await fetch(`${API_URL}/${recetaId}`);
    return response.json();
  },

  addToReceta: async (
    recetaId: number,
    ingredienteId: number,
    cantidad: number,
    unidad: string,
  ): Promise<RecetaIngrediente> => {
    const response = await fetch(`${API_URL}/${recetaId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredienteId, cantidad, unidad }),
    });
    return response.json();
  },

  deleteFromReceta: async (recetaId: number): Promise<void> => {
    await fetch(`${API_URL}/${recetaId}`, { method: 'DELETE' });
  },
};
