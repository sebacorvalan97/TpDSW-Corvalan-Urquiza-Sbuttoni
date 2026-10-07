export interface PasoReceta {
  idPaso: number;
  recetaId: number;
  numeroOrden: number;
  descripcion: string;
}

const API_URL = 'http://localhost:8080/api/pasos-receta';

export const pasoRecetaService = {
  getAllPasos: async (): Promise<PasoReceta[]> => {
    const response = await fetch(API_URL);
    return response.json();
  },

  createPaso: async (
    recetaId: number,
    numeroOrden: number,
    descripcion: string,
  ): Promise<PasoReceta> => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recetaId, numeroOrden, descripcion }),
    });
    return response.json();
  },

  updatePaso: async (
    idPaso: number,
    newData: Partial<PasoReceta>,
  ): Promise<PasoReceta> => {
    const response = await fetch(`${API_URL}/${idPaso}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newData),
    });
    return response.json();
  },

  deletePaso: async (idPaso: number): Promise<void> => {
    await fetch(`${API_URL}/${idPaso}`, { method: 'DELETE' });
  },

  getPasoById: async (idPaso: number): Promise<PasoReceta> => {
    const response = await fetch(`${API_URL}/${idPaso}`);
    return response.json();
  },
};
