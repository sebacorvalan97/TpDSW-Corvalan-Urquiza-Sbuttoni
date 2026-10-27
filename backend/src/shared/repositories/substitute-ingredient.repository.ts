/**
 * CAPA DE DATOS (Repository) de Ingredientes Sustitutos.
 *
 * Su ÚNICA responsabilidad es guardar y buscar ingredientes sustitutos. No valida nada ni sabe de HTTP.
 * Hoy los datos viven en un arreglo en memoria (se pierden al apagar el servidor).
 * Cuando agreguemos la base de datos + ORM, solo hay que cambiar ESTE archivo:
 * el servicio, el controlador y el frontend siguen funcionando igual.
 */

// Forma completa de un ingrediente sustituto, tal cual la devuelve la API.
export interface SubstituteIngredient {
    idSubstituteIngredient: number;
    ingredientePrincipalId: number;
    nombreSustituto: string;
    proporcion: string;
    notas: string;
}

// Datos que envía el usuario para crear/editar (el id lo asigna el sistema, no el usuario).
// Omit<Tipo, 'campo'> significa: "el mismo tipo, pero sin ese campo".
export type SubstituteIngredientInput = Omit<SubstituteIngredient, 'idSubstituteIngredient'>;

// "Base de datos" en memoria.
const substituteIngredients: SubstituteIngredient[] = [];
// Contador para dar ids únicos y crecientes: 1, 2, 3...
let nextId = 1;

export const substituteIngredientRepository = {
    // READ (todos los sustitutos correspondientes a un ingrediente principal)
    getAllByIngredientId: (ingredientePrincipalId: number): SubstituteIngredient[] => {
        return substituteIngredients.filter((s) => s.ingredientePrincipalId === ingredientePrincipalId);
    },

    // READ (uno por id). Devuelve null si no existe.
    getSubstituteById: (idSubstituteIngredient: number): SubstituteIngredient | null => {
        return substituteIngredients.find((s) => s.idSubstituteIngredient === idSubstituteIngredient) ?? null;
    },

    // Búsqueda por nombre exacto dentro del mismo ingrediente principal sin distinguir mayúsculas (sirve para evitar duplicados).
    getSubstituteByNameAndIngredientId: (ingredientePrincipalId: number, nombreSustituto: string): SubstituteIngredient | null => {
        const buscado = nombreSustituto.toLowerCase();
        return substituteIngredients.find(
            (s) => s.ingredientePrincipalId === ingredientePrincipalId && s.nombreSustituto.toLowerCase() === buscado
        ) ?? null;
    },

    // CREATE
    createSubstitute: (data: SubstituteIngredientInput): SubstituteIngredient => {
        const newSubstitute: SubstituteIngredient = { idSubstituteIngredient: nextId++, ...data };
        substituteIngredients.push(newSubstitute);
        return newSubstitute;
    },

    // UPDATE. Devuelve el sustituto actualizado o null si el id no existe.
    updateSubstitute: (idSubstituteIngredient: number, data: SubstituteIngredientInput): SubstituteIngredient | null => {
        const index = substituteIngredients.findIndex((s) => s.idSubstituteIngredient === idSubstituteIngredient);
        if (index === -1) return null;
        const updated: SubstituteIngredient = { idSubstituteIngredient, ...data };
        substituteIngredients[index] = updated;
        return updated;
    },

    // DELETE. Devuelve true si se borró, false si el id no existía.
    deleteSubstitute: (idSubstituteIngredient: number): boolean => {
        const index = substituteIngredients.findIndex((s) => s.idSubstituteIngredient === idSubstituteIngredient);
        if (index === -1) return false;
        substituteIngredients.splice(index, 1);
        return true;
    },
};
