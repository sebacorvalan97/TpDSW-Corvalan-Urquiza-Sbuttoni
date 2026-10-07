export interface Receta {
  idReceta: number;
  nombre: string;
  descripcion?: string;
  tiempoMinutos?: number;
}

const API_URL = 'http://localhost:8080/api/recetas';

export const recetaService = {
  async getAllRecetas(): Promise<Receta[]> {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Error al obtener las recetas');
    return response.json();
  },

  async createReceta(
    nombre: string,
    descripcion: string,
    tiempoMinutos: number,
  ): Promise<Receta> {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, descripcion, tiempoMinutos }),
    });
    if (!response.ok) throw new Error('Error al crear la receta');
    return response.json();
  },

  async updateReceta(
    idReceta: number,
    data: { nombre: string; descripcion: string; tiempoMinutos: number },
  ): Promise<Receta> {
    const response = await fetch(`${API_URL}/${idReceta}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al actualizar la receta');
    return response.json();
  },

  async deleteReceta(idReceta: number): Promise<void> {
    const response = await fetch(`${API_URL}/${idReceta}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar la receta');
  },
};
