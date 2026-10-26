import { prisma } from '../prisma.js';

export interface Ingredient {
    idIngredient: number;
    nombre: string;
    descripcion: string;
    unidadMedidaDefecto: string;
}

export type IngredientInput = Omit<Ingredient, 'idIngredient'>;

const fromDatabase = (ingredient: {
    idIngrediente: number;
    nombreIngrediente: string;
    descripcion: string;
    unidadMedidaDefecto: string;
}): Ingredient => ({
    idIngredient: ingredient.idIngrediente,
    nombre: ingredient.nombreIngrediente,
    descripcion: ingredient.descripcion,
    unidadMedidaDefecto: ingredient.unidadMedidaDefecto,
});

export const ingredientRepository = {
    getAllIngredients: async (): Promise<Ingredient[]> => {
        const ingredients = await prisma.ingrediente.findMany({ orderBy: { idIngrediente: 'asc' } });
        return ingredients.map(fromDatabase);
    },

    getIngredientById: async (idIngredient: number): Promise<Ingredient | null> => {
        const ingredient = await prisma.ingrediente.findUnique({ where: { idIngrediente: idIngredient } });
        return ingredient ? fromDatabase(ingredient) : null;
    },

    getIngredientByName: async (nombre: string): Promise<Ingredient | null> => {
        const ingredient = await prisma.ingrediente.findUnique({ where: { nombreIngrediente: nombre } });
        return ingredient ? fromDatabase(ingredient) : null;
    },

    createIngredient: async (data: IngredientInput): Promise<Ingredient> => {
        const ingredient = await prisma.ingrediente.create({
            data: {
                nombreIngrediente: data.nombre,
                descripcion: data.descripcion,
                unidadMedidaDefecto: data.unidadMedidaDefecto,
            },
        });
        return fromDatabase(ingredient);
    },

    updateIngredient: async (idIngredient: number, data: IngredientInput): Promise<Ingredient | null> => {
        const updated = await prisma.ingrediente.updateMany({
            where: { idIngrediente: idIngredient },
            data: {
                nombreIngrediente: data.nombre,
                descripcion: data.descripcion,
                unidadMedidaDefecto: data.unidadMedidaDefecto,
            },
        });
        return updated.count === 0 ? null : ingredientRepository.getIngredientById(idIngredient);
    },

    deleteIngredient: async (idIngredient: number): Promise<boolean> => {
        const deleted = await prisma.ingrediente.deleteMany({ where: { idIngrediente: idIngredient } });
        return deleted.count > 0;
    },
};
