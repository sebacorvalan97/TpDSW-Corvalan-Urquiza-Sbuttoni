import { Plato } from '../types';

const API_URL = 'http://localhost:8080/api/dishes';

export const platoService = {
  getAllPlatos: async (): Promise<Plato[]> => {
    const response = await fetch(API_URL);
    return response.json();
  },

  createPlato: async (name: string, description: string): Promise<Plato> => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    });
    return response.json();
  },

  updatePlato: async (
    idDish: number,
    newData: Partial<Plato>,
  ): Promise<Plato> => {
    const response = await fetch(`${API_URL}/${idDish}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newData),
    });
    return response.json();
  },

  deletePlato: async (idDish: number): Promise<void> => {
    await fetch(`${API_URL}/${idDish}`, { method: 'DELETE' });
  },

  getPlatoById: async (idDish: number): Promise<Plato> => {
    const response = await fetch(`${API_URL}/${idDish}`);
    return response.json();
  },
};
