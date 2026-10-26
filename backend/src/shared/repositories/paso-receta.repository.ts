import { prisma } from '../prisma.js';

export interface PasoReceta {
  idPaso: number;
  recetaId: number;
  numeroOrden: number;
  descripcion: string;
}

const fromDatabase = (step: {
  idPaso: number;
  idReceta: number;
  numeroOrden: number;
  descripcionPaso: string;
}): PasoReceta => ({
  idPaso: step.idPaso,
  recetaId: step.idReceta,
  numeroOrden: step.numeroOrden,
  descripcion: step.descripcionPaso,
});

export const pasoRecetaRepository = {
  getAllPasos: async (): Promise<PasoReceta[]> => {
    const steps = await prisma.pasoReceta.findMany({ orderBy: [{ idReceta: 'asc' }, { numeroOrden: 'asc' }] });
    return steps.map(fromDatabase);
  },

  createPaso: async (recetaId: number, numeroOrden: number, descripcion: string): Promise<PasoReceta> => {
    const step = await prisma.pasoReceta.create({
      data: { idReceta: recetaId, numeroOrden, descripcionPaso: descripcion },
    });
    return fromDatabase(step);
  },

  updatePaso: async (idPaso: number, newData: Partial<PasoReceta>): Promise<PasoReceta | null> => {
    const updated = await prisma.pasoReceta.updateMany({
      where: { idPaso },
      data: {
        ...(newData.recetaId === undefined ? {} : { idReceta: newData.recetaId }),
        ...(newData.numeroOrden === undefined ? {} : { numeroOrden: newData.numeroOrden }),
        ...(newData.descripcion === undefined ? {} : { descripcionPaso: newData.descripcion }),
      },
    });
    if (updated.count === 0) return null;
    const step = await prisma.pasoReceta.findUnique({ where: { idPaso } });
    return step ? fromDatabase(step) : null;
  },

  deletePaso: async (idPaso: number): Promise<boolean> => {
    const deleted = await prisma.pasoReceta.deleteMany({ where: { idPaso } });
    return deleted.count > 0;
  },

  getPasoById: async (idPaso: number): Promise<PasoReceta | null> => {
    const step = await prisma.pasoReceta.findUnique({ where: { idPaso } });
    return step ? fromDatabase(step) : null;
  },
};
