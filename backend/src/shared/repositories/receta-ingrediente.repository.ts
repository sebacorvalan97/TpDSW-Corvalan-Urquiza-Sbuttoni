import { prisma } from '../prisma.js';

export interface RecetaIngrediente {
  idRecetaIngrediente: number;
  recetaId: number;
  ingredienteId: number;
  cantidad: number;
  unidad: string;
}

const fromDatabase = (item: {
  idItemReceta: number;
  idReceta: number;
  idIngrediente: number;
  cantidadIngrediente: { toNumber(): number };
  unidadMedida: string;
}): RecetaIngrediente => ({
  idRecetaIngrediente: item.idItemReceta,
  recetaId: item.idReceta,
  ingredienteId: item.idIngrediente,
  cantidad: item.cantidadIngrediente.toNumber(),
  unidad: item.unidadMedida,
});

export const recetaIngredienteRepository = {
  getAllByRecetaId: async (recetaId: number): Promise<RecetaIngrediente[]> => {
    const items = await prisma.itemReceta.findMany({
      where: { idReceta: recetaId },
      orderBy: { idItemReceta: 'asc' },
    });
    return items.map(fromDatabase);
  },

  create: async (
    recetaId: number,
    ingredienteId: number,
    cantidad: number,
    unidad: string,
  ): Promise<RecetaIngrediente> => {
    const item = await prisma.itemReceta.create({
      data: {
        idReceta: recetaId,
        idIngrediente: ingredienteId,
        cantidadIngrediente: cantidad,
        unidadMedida: unidad,
      },
    });
    return fromDatabase(item);
  },

  deleteByRecetaId: async (recetaId: number): Promise<number> => {
    const deleted = await prisma.itemReceta.deleteMany({ where: { idReceta: recetaId } });
    return deleted.count;
  },
};
