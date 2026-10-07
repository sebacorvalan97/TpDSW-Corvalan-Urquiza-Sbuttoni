/**
 * CAPA DE DATOS (Repository) de Categorías.
 *
 * Su ÚNICA responsabilidad es guardar y buscar categorías. No valida nada ni sabe de HTTP.
 * Hoy los datos viven en un arreglo en memoria (se pierden al apagar el servidor).
 * Más adelante, cuando agreguemos la base de datos + ORM, solo hay que cambiar ESTE archivo:
 * el servicio, el controlador y el frontend siguen funcionando igual.
 */

// Forma completa de una categoría, tal cual la devuelve la API.
export interface Category {
    idCategory: number;
    nombre: string;
    descripcion: string;
}

// Datos que envía el usuario para crear/editar (el id lo asigna el sistema, no el usuario).
export type CategoryInput = Omit<Category, 'idCategory'>;

// "Base de datos" en memoria.
const categories: Category[] = [];
// Contador para dar ids únicos y crecientes: 1, 2, 3...
let nextId = 1;

export const categoryRepository = {
    // READ (todas)
    getAllCategories: (): Category[] => {
        return categories;
    },

    // READ (una). Devuelve null si no existe.
    getCategoryById: (idCategory: number): Category | null => {
        return categories.find((c) => c.idCategory === idCategory) ?? null;
    },

    // Búsqueda por nombre exacto sin distinguir mayúsculas (sirve para evitar duplicados).
    getCategoryByName: (nombre: string): Category | null => {
        const buscado = nombre.toLowerCase();
        return categories.find((c) => c.nombre.toLowerCase() === buscado) ?? null;
    },

    // CREATE
    createCategory: (data: CategoryInput): Category => {
        const newCategory: Category = { idCategory: nextId++, ...data };
        categories.push(newCategory);
        return newCategory;
    },

    // UPDATE. Devuelve la categoría actualizada o null si el id no existe.
    updateCategory: (idCategory: number, data: CategoryInput): Category | null => {
        const index = categories.findIndex((c) => c.idCategory === idCategory);
        if (index === -1) return null;
        const updated: Category = { idCategory, ...data };
        categories[index] = updated;
        return updated;
    },

    // DELETE. Devuelve true si se borró, false si el id no existía.
    deleteCategory: (idCategory: number): boolean => {
        const index = categories.findIndex((c) => c.idCategory === idCategory);
        if (index === -1) return false;
        categories.splice(index, 1);   // splice(posición, cantidad) elimina elementos del arreglo
        return true;
    },
};
