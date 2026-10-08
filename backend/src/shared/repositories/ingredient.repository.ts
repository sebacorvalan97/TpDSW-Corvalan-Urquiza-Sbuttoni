/**
 * CAPA DE DATOS (Repository) de Ingredientes.
 *
 * Su ÚNICA responsabilidad es guardar y buscar ingredientes. No valida nada ni sabe de HTTP.
 * Hoy los datos viven en un arreglo en memoria (se pierden al apagar el servidor).
 * Cuando agreguemos la base de datos + ORM, solo hay que cambiar ESTE archivo:
 * el servicio, el controlador y el frontend siguen funcionando igual.
 */

// Forma completa de un ingrediente, tal cual la devuelve la API.
export interface Ingredient {
    idIngredient: number;
    nombre: string;
    descripcion: string;
    // Unidad en la que normalmente se mide (ej: 'g' para harina, 'unidad' para huevo).
    // Después, al armar una receta, esta unidad se propone por defecto.
    unidadMedidaDefecto: string;
}

// Datos que envía el usuario para crear/editar (el id lo asigna el sistema, no el usuario).
// Omit<Tipo, 'campo'> significa: "el mismo tipo, pero sin ese campo".
export type IngredientInput = Omit<Ingredient, 'idIngredient'>;

// "Base de datos" en memoria.
const ingredients: Ingredient[] = [];
// Contador para dar ids únicos y crecientes: 1, 2, 3...
let nextId = 1;

export const ingredientRepository = {
    // READ (todos)
    getAllIngredients: (): Ingredient[] => {
        return ingredients;
    },

    // READ (uno). Devuelve null si no existe.
    getIngredientById: (idIngredient: number): Ingredient | null => {
        return ingredients.find((i) => i.idIngredient === idIngredient) ?? null;
    },

    // Búsqueda por nombre exacto sin distinguir mayúsculas (sirve para evitar duplicados).
    getIngredientByName: (nombre: string): Ingredient | null => {
        const buscado = nombre.toLowerCase();
        return ingredients.find((i) => i.nombre.toLowerCase() === buscado) ?? null;
    },

    // CREATE
    createIngredient: (data: IngredientInput): Ingredient => {
        const newIngredient: Ingredient = { idIngredient: nextId++, ...data };
        ingredients.push(newIngredient);
        return newIngredient;
    },

    // UPDATE. Devuelve el ingrediente actualizado o null si el id no existe.
    updateIngredient: (idIngredient: number, data: IngredientInput): Ingredient | null => {
        const index = ingredients.findIndex((i) => i.idIngredient === idIngredient);
        if (index === -1) return null;
        const updated: Ingredient = { idIngredient, ...data };
        ingredients[index] = updated;
        return updated;
    },

    // DELETE. Devuelve true si se borró, false si el id no existía.
    deleteIngredient: (idIngredient: number): boolean => {
        const index = ingredients.findIndex((i) => i.idIngredient === idIngredient);
        if (index === -1) return false;
        ingredients.splice(index, 1);   // splice(posición, cantidad) elimina elementos del arreglo
        return true;
    },
};
