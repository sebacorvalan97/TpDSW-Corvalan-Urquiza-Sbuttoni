import { prisma } from '../prisma.js';
import type { Prisma } from '../../generated/prisma/client.js';

export interface Recipe {
    idRecipe: number;
    idDish: number;
    descripcion: string;
    duracion: string;
    createdByUserId: number | null;
    createdByName: string | null;
    nombre: string;
    imagenUrl: string;
    idCategory: number | null;
    idDifficulty: number | null;
    origins: Array<{ idOrigin: number; nombre: string; pais: string }>;
    ingredients: Array<{
        idIngredient: number;
        nombre: string;
        unidadMedidaDefecto: string;
        cantidad: number;
        unidad: string;
    }>;
    steps: Array<{ idStep: number; order: number; descripcion: string }>;
    ratingAverage: number;
    ratingCount: number;
}

export interface RecipeWriteData {
    nombre?: string;
    imagenUrl?: string;
    descripcion?: string;
    duracion?: string;
    idCategory?: number | null;
    idDifficulty?: number | null;
    idOrigin?: number | null;
    ingredients?: Array<{ idIngredient: number; cantidad: number; unidad: string }>;
    steps?: string[];
}

const recipeInclude = {
    plato: { include: { origenes: { include: { origen: true } }, comentarios: { select: { calificacion: true } } } },
    categoria: true,
    dificultad: true,
    items: { include: { ingrediente: true }, orderBy: { idItemReceta: 'asc' } },
    pasos: { orderBy: { numeroOrden: 'asc' } },
    creador: true,
} as const;

type DatabaseRecipe = Prisma.RecetaGetPayload<{ include: typeof recipeInclude }>;

const fromDatabase = (recipe: DatabaseRecipe): Recipe => ({
    idRecipe: recipe.idReceta,
    idDish: recipe.idPlato,
    descripcion: recipe.descripcionReceta ?? '',
    duracion: recipe.duracion ?? '',
    createdByUserId: recipe.idCuentaCreador,
    createdByName: recipe.creador ? [recipe.creador.nombre, recipe.creador.apellido].filter(Boolean).join(' ') : null,
    nombre: recipe.plato.nombre,
    imagenUrl: recipe.plato.imagenUrl ?? '',
    idCategory: recipe.idCategoria,
    idDifficulty: recipe.idDificultad,
    origins: recipe.plato.origenes.map(({ origen }) => ({
        idOrigin: origen.idOrigen,
        nombre: origen.nombreOrigen,
        pais: origen.paisReferencia,
    })),
    ingredients: recipe.items.map((item) => ({
        idIngredient: item.idIngrediente,
        nombre: item.ingrediente.nombreIngrediente,
        unidadMedidaDefecto: item.ingrediente.unidadMedidaDefecto,
        cantidad: item.cantidadIngrediente.toNumber(),
        unidad: item.unidadMedida,
    })),
    steps: recipe.pasos.map((step) => ({
        idStep: step.idPaso,
        order: step.numeroOrden,
        descripcion: step.descripcionPaso,
    })),
    ratingAverage: recipe.plato.comentarios.length
        ? recipe.plato.comentarios.reduce((sum, comment) => sum + comment.calificacion, 0) / recipe.plato.comentarios.length
        : 0,
    ratingCount: recipe.plato.comentarios.length,
});

export interface RecipeFilters {
    categoryId?: number | undefined;
    originId?: number | undefined;
    difficultyId?: number | undefined;
    search?: string | undefined;
}

export const recipeRepository = {
    getAllRecipes: async (filters?: RecipeFilters): Promise<Recipe[]> => {
        const where: Prisma.RecetaWhereInput = {};
        if (filters?.categoryId) {
            where.idCategoria = filters.categoryId;
        }
        if (filters?.difficultyId) {
            where.idDificultad = filters.difficultyId;
        }
        if (filters?.originId) {
            where.plato = {
                origenes: {
                    some: {
                        idOrigen: filters.originId,
                    },
                },
            };
        }
        if (filters?.search && filters.search.trim()) {
            const query = filters.search.trim();
            where.OR = [
                { plato: { nombre: { contains: query } } },
                { plato: { descripcionReceta: { contains: query } } },
                { descripcionReceta: { contains: query } },
                { plato: { origenes: { some: { origen: { paisReferencia: { contains: query } } } } } },
                { plato: { origenes: { some: { origen: { nombreOrigen: { contains: query } } } } } },
                { categoria: { nombreCategoria: { contains: query } } },
                { items: { some: { ingrediente: { nombreIngrediente: { contains: query } } } } },
            ];
        }

        const recipes = await prisma.receta.findMany({
            where,
            include: recipeInclude,
            orderBy: { idReceta: 'asc' },
        });
        return recipes.map(fromDatabase);
    },

    createRecipe: async (
        data: RecipeWriteData,
        createdByUserId: number | null,
    ): Promise<Recipe> => {
        const recipe = await prisma.receta.create({
            data: {
                descripcionReceta: data.descripcion ?? '',
                duracion: data.duracion ?? '',
                ...(data.idCategory == null ? {} : { categoria: { connect: { idCategoria: data.idCategory } } }),
                ...(data.idDifficulty == null ? {} : { dificultad: { connect: { idDificultad: data.idDifficulty } } }),
                plato: {
                    create: {
                        nombre: (data.nombre ?? data.descripcion ?? '').slice(0, 200),
                        descripcionReceta: data.descripcion ?? '',
                        imagenUrl: data.imagenUrl ?? null,
                        ...(data.idOrigin == null ? {} : {
                            origenes: { create: { origen: { connect: { idOrigen: data.idOrigin } } } },
                        }),
                    },
                },
                ...(data.ingredients === undefined ? {} : {
                    items: { create: data.ingredients.map((item) => ({
                        ingrediente: { connect: { idIngrediente: item.idIngredient } },
                        cantidadIngrediente: item.cantidad,
                        unidadMedida: item.unidad,
                    })) },
                }),
                ...(data.steps === undefined ? {} : {
                    pasos: { create: data.steps.map((descripcionPaso, index) => ({
                        numeroOrden: index + 1,
                        descripcionPaso,
                    })) },
                }),
                ...(createdByUserId === null
                    ? {}
                    : { creador: { connect: { idCuenta: createdByUserId } } }),
            },
            include: recipeInclude,
        });
        return fromDatabase(recipe);
    },

    updateRecipe: async (
        idRecipe: number,
        newData: RecipeWriteData,
    ): Promise<Recipe | null> => {
        const existing = await prisma.receta.findUnique({
            where: { idReceta: idRecipe },
            select: { idPlato: true },
        });
        if (!existing) return null;

        return prisma.$transaction(async (transaction) => {
            await transaction.receta.update({
                where: { idReceta: idRecipe },
                data: {
                    ...(newData.descripcion === undefined ? {} : { descripcionReceta: newData.descripcion }),
                    ...(newData.duracion === undefined ? {} : { duracion: newData.duracion }),
                    ...(newData.idCategory === undefined ? {} : { idCategoria: newData.idCategory }),
                    ...(newData.idDifficulty === undefined ? {} : { idDificultad: newData.idDifficulty }),
                },
            });
            if (newData.nombre !== undefined || newData.descripcion !== undefined || newData.imagenUrl !== undefined || newData.idOrigin !== undefined) {
                await transaction.plato.update({
                    where: { idPlato: existing.idPlato },
                    data: {
                        ...(newData.nombre === undefined ? {} : { nombre: newData.nombre.slice(0, 200) }),
                        ...(newData.descripcion === undefined ? {} : { descripcionReceta: newData.descripcion }),
                        ...(newData.imagenUrl === undefined ? {} : { imagenUrl: newData.imagenUrl || null }),
                        ...(newData.idOrigin === undefined ? {} : {
                            origenes: {
                                deleteMany: {},
                                ...(newData.idOrigin === null ? {} : {
                                    create: { origen: { connect: { idOrigen: newData.idOrigin } } },
                                }),
                            },
                        }),
                    },
                });
            }
            if (newData.ingredients !== undefined) {
                await transaction.itemReceta.deleteMany({ where: { idReceta: idRecipe } });
                if (newData.ingredients.length) {
                    await transaction.itemReceta.createMany({
                        data: newData.ingredients.map((item) => ({
                            idReceta: idRecipe,
                            idIngrediente: item.idIngredient,
                            cantidadIngrediente: item.cantidad,
                            unidadMedida: item.unidad,
                        })),
                    });
                }
            }
            if (newData.steps !== undefined) {
                await transaction.pasoReceta.deleteMany({ where: { idReceta: idRecipe } });
                if (newData.steps.length) {
                    await transaction.pasoReceta.createMany({
                        data: newData.steps.map((descripcionPaso, index) => ({
                            idReceta: idRecipe,
                            numeroOrden: index + 1,
                            descripcionPaso,
                        })),
                    });
                }
            }
            const recipe = await transaction.receta.findUnique({
                where: { idReceta: idRecipe },
                include: recipeInclude,
            });
            return recipe ? fromDatabase(recipe) : null;
        });
    },

    deleteRecipe: async (idRecipe: number): Promise<boolean> => prisma.$transaction(async (transaction) => {
        const recipe = await transaction.receta.findUnique({
            where: { idReceta: idRecipe },
            select: { idPlato: true },
        });
        if (!recipe) return false;
        await transaction.receta.delete({ where: { idReceta: idRecipe } });
        await transaction.plato.delete({ where: { idPlato: recipe.idPlato } });
        return true;
    }),

    getRecipeById: async (idRecipe: number): Promise<Recipe | null> => {
        const recipe = await prisma.receta.findUnique({
            where: { idReceta: idRecipe },
            include: recipeInclude,
        });
        return recipe ? fromDatabase(recipe) : null;
    },
};
