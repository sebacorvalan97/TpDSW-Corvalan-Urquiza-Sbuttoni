import { prisma } from '../prisma.js';
import { HttpError } from '../errors/http-error.js';

export const userFeaturesRepository = {
    getFavoriteRecipeIds: async (userId: number): Promise<number[]> => {
        const favorites = await prisma.favorito.findMany({
            where: { idCuenta: userId },
            select: { idReceta: true },
            orderBy: { fechaAlta: 'desc' },
        });
        return favorites.map(({ idReceta }) => idReceta);
    },

    toggleFavorite: async (userId: number, recipeId: number): Promise<boolean> => prisma.$transaction(async (transaction) => {
        const recipe = await transaction.receta.findUnique({
            where: { idReceta: recipeId },
            select: { idReceta: true },
        });
        if (!recipe) {
            throw new HttpError(404, 'Receta no encontrada.');
        }
        const existing = await transaction.favorito.findUnique({
            where: { idCuenta_idReceta: { idCuenta: userId, idReceta: recipeId } },
        });
        if (existing) {
            await transaction.favorito.delete({
                where: { idCuenta_idReceta: { idCuenta: userId, idReceta: recipeId } },
            });
            return false;
        }
        await transaction.favorito.create({ data: { idCuenta: userId, idReceta: recipeId } });
        return true;
    }),

    getPantry: async (userId: number) => {
        const items = await prisma.itemAlacena.findMany({
            where: { idCuenta: userId },
            include: { ingrediente: true },
            orderBy: { ingrediente: { nombreIngrediente: 'asc' } },
        });
        return items.map((item) => ({
            idIngredient: item.idIngrediente,
            nombre: item.ingrediente.nombreIngrediente,
            unidadMedidaDefecto: item.ingrediente.unidadMedidaDefecto,
            cantidad: item.cantidadIngrediente.toNumber(),
            unidad: item.unidadMedida,
        }));
    },

    setPantryItem: async (userId: number, ingredientId: number, cantidad: number, unidad: string) => {
        await prisma.itemAlacena.upsert({
            where: { idCuenta_idIngrediente: { idCuenta: userId, idIngrediente: ingredientId } },
            create: {
                idCuenta: userId,
                idIngrediente: ingredientId,
                cantidadIngrediente: cantidad,
                unidadMedida: unidad,
            },
            update: { cantidadIngrediente: cantidad, unidadMedida: unidad },
        });
        return userFeaturesRepository.getPantry(userId);
    },

    removePantryItem: async (userId: number, ingredientId: number): Promise<boolean> => {
        const deleted = await prisma.itemAlacena.deleteMany({
            where: { idCuenta: userId, idIngrediente: ingredientId },
        });
        return deleted.count > 0;
    },

    getSubstitutes: async (ingredientId?: number) => {
        const substitutes = await prisma.ingredienteSustituto.findMany({
            ...(ingredientId === undefined ? {} : { where: { idIngrediente: ingredientId } }),
            include: { original: true, sustituto: true },
            orderBy: [{ idIngrediente: 'asc' }, { idSustituto: 'asc' }],
        });
        return substitutes.map((item) => ({
            id: `${item.idIngrediente}-${item.idSustituto}`,
            ingredientId: item.idIngrediente,
            ingredientName: item.original.nombreIngrediente,
            substituteId: item.idSustituto,
            substituteName: item.sustituto.nombreIngrediente,
            proportion: item.proporcionConversion,
            notes: item.notas,
        }));
    },

    createSubstitute: async (ingredientId: number, substituteId: number, proportion: string, notes: string) => {
        const item = await prisma.ingredienteSustituto.create({
            data: {
                idIngrediente: ingredientId,
                idSustituto: substituteId,
                proporcionConversion: proportion,
                notas: notes,
            },
            include: { original: true, sustituto: true },
        });
        return {
            id: `${item.idIngrediente}-${item.idSustituto}`,
            ingredientId: item.idIngrediente,
            ingredientName: item.original.nombreIngrediente,
            substituteId: item.idSustituto,
            substituteName: item.sustituto.nombreIngrediente,
            proportion: item.proporcionConversion,
            notes: item.notas,
        };
    },

    deleteSubstitute: async (ingredientId: number, substituteId: number): Promise<boolean> => {
        const deleted = await prisma.ingredienteSustituto.deleteMany({
            where: { idIngrediente: ingredientId, idSustituto: substituteId },
        });
        return deleted.count > 0;
    },
};
