export interface PasoReceta {
  idPaso: number;
  recetaId: number;
  numeroOrden: number;
  descripcion: string;
}

const pasosReceta: PasoReceta[] = [];
let idCurrentPaso = 1;

export const pasoRecetaRepository = {
  getAllPasos: () => pasosReceta,

  createPaso: (recetaId: number, numeroOrden: number, descripcion: string) => {
    const newPaso: PasoReceta = {
      idPaso: idCurrentPaso++,
      recetaId,
      numeroOrden,
      descripcion,
    };
    pasosReceta.push(newPaso);
    return newPaso;
  },

  updatePaso: (idPaso: number, newData: Partial<PasoReceta>) => {
    const index = pasosReceta.findIndex((p) => p.idPaso === idPaso);
    if (index !== -1) {
      pasosReceta[index] = { ...pasosReceta[index], ...newData } as PasoReceta;
      return pasosReceta[index];
    }
    return null;
  },

  deletePaso: (idPaso: number) => {
    const index = pasosReceta.findIndex((p) => p.idPaso === idPaso);
    if (index !== -1) {
      return pasosReceta.splice(index, 1);
    }
    return null;
  },

  getPasoById: (idPaso: number) => {
    return pasosReceta.find((p) => p.idPaso === idPaso) || null;
  },
};
