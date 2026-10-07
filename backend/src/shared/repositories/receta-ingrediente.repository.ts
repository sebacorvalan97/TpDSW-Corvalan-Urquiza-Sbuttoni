export interface RecetaIngrediente {
    idRecetaIngrediente: number;
    recetaId: number;
    ingredienteId: number;
    cantidad: number;
    unidad: string;
}

const recetasIngredientes: RecetaIngrediente[] = [];
let idCurrent = 1;

export const recetaIngredienteRepository = {
    getAllByRecetaId: (recetaId: number) => 
        recetasIngredientes.filter(ri => ri.recetaId === recetaId),

    create: (recetaId: number, ingredienteId: number, cantidad: number, unidad: string) => {
        const newItem: RecetaIngrediente = { idRecetaIngrediente: idCurrent++, recetaId, ingredienteId, cantidad, unidad };
        recetasIngredientes.push(newItem);
        return newItem;
    },

    deleteByRecetaId: (recetaId: number) => {
        const index = recetasIngredientes.findIndex(ri => ri.recetaId === recetaId);
        if (index !== -1) {
            recetasIngredientes.splice(index, 1);
        }
    }
};
