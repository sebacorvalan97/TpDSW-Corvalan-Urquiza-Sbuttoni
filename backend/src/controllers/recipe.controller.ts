import type { Request, Response } from 'express';
import { recipeRepository, type RecipeWriteData } from '../shared/repositories/recipe.repository.js';
import { HttpError } from '../shared/errors/http-error.js';
import { getSessionFromRequest } from '../middleware/auth.js';
import { assertCanManageRecipe } from '../shared/utils/recipe-authorization.js';

const readRecipeData = (body: unknown, partial: boolean): RecipeWriteData => {
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
        throw new HttpError(400, 'Los datos de la receta no son válidos.');
    }

    const input = body as Record<string, unknown>;
    const data: RecipeWriteData = {};
    for (const field of ['nombre', 'descripcion'] as const) {
        const value = input[field];
        if (value !== undefined) {
            if (typeof value !== 'string' || !value.trim()) throw new HttpError(400, `${field} es obligatorio.`);
            data[field] = value.trim();
        } else if (!partial) {
            throw new HttpError(400, `${field} es obligatorio.`);
        }
    }

    if (input.imagenUrl !== undefined) {
        if (typeof input.imagenUrl !== 'string' || input.imagenUrl.length > 500) {
            throw new HttpError(400, 'La URL de la imagen debe tener 500 caracteres o menos.');
        }
        data.imagenUrl = input.imagenUrl.trim();
    }

    if (input.duracion !== undefined) {
        const duracion = typeof input.duracion === 'number' ? String(input.duracion) : input.duracion;
        if (typeof duracion !== 'string' || !duracion.trim()) throw new HttpError(400, 'La duración es obligatoria.');
        data.duracion = duracion.trim();
    } else if (!partial) {
        throw new HttpError(400, 'La duración es obligatoria.');
    }

    for (const [field, property] of [
        ['idCategory', 'idCategory'],
        ['idDifficulty', 'idDifficulty'],
        ['idOrigin', 'idOrigin'],
    ] as const) {
        const value = input[field];
        if (value !== undefined) {
            if (value !== null && (!Number.isInteger(value) || (value as number) <= 0)) {
                throw new HttpError(400, `El campo ${field} no es válido.`);
            }
            data[property] = value as number | null;
        }
    }

    if (input.ingredients !== undefined) {
        if (!Array.isArray(input.ingredients)) throw new HttpError(400, 'La lista de ingredientes no es válida.');
        data.ingredients = input.ingredients.map((ingredient: unknown) => {
            if (typeof ingredient !== 'object' || ingredient === null || Array.isArray(ingredient)) {
                throw new HttpError(400, 'Un ingrediente de la receta no es válido.');
            }
            const item = ingredient as Record<string, unknown>;
            if (
                !Number.isInteger(item.idIngredient) || (item.idIngredient as number) <= 0 ||
                typeof item.cantidad !== 'number' || !Number.isFinite(item.cantidad) || item.cantidad <= 0 ||
                typeof item.unidad !== 'string' || !item.unidad.trim()
            ) {
                throw new HttpError(400, 'Cada ingrediente debe tener un ingrediente, cantidad y unidad válidos.');
            }
            return {
                idIngredient: item.idIngredient as number,
                cantidad: item.cantidad,
                unidad: item.unidad.trim(),
            };
        });
    }

    if (input.steps !== undefined) {
        if (!Array.isArray(input.steps) || input.steps.some((step) => typeof step !== 'string' || !step.trim())) {
            throw new HttpError(400, 'Los pasos de preparación no son válidos.');
        }
        data.steps = input.steps.map((step: string) => step.trim());
    }

    return data;
};

const readRecipeId = (value: string | string[] | undefined): number => {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'El identificador de receta no es válido.');
    return id;
};

export const recipeController = {
    getAllRecipes: async (_req: Request, res: Response) => {
        const recipes = await recipeRepository.getAllRecipes();
        res.json(recipes);
    },

    createRecipe: async (req: Request, res: Response) => {
        const data = readRecipeData(req.body, false);
        const session = getSessionFromRequest(req);
        if (!session) throw new HttpError(401, 'Inicia sesión para crear una receta.');
        const newRecipe = await recipeRepository.createRecipe(
            data,
            session.role === 'user' ? session.id : null,
        );
        res.status(201).json(newRecipe);
    },

    updateRecipe: async (req: Request, res: Response) => {
        const idRecipe = readRecipeId(req.params.id);
        const session = getSessionFromRequest(req);
        await assertCanManageRecipe(idRecipe, session);
        const recipe = await recipeRepository.updateRecipe(idRecipe, readRecipeData(req.body, true));
        if (!recipe) return res.status(404).json({ message: 'Receta no encontrada.' });
        return res.json(recipe);
    },

    deleteRecipe: async (req: Request, res: Response) => {
        const idRecipe = readRecipeId(req.params.id);
        const session = getSessionFromRequest(req);
        await assertCanManageRecipe(idRecipe, session);
        await recipeRepository.deleteRecipe(idRecipe);
        return res.json({ message: 'Receta eliminada correctamente.' });
    },

    getRecipeById: async (req: Request, res: Response) => {
        const idRecipe = readRecipeId(req.params.id);
        const recipe = await recipeRepository.getRecipeById(idRecipe);
        if (!recipe) return res.status(404).json({ message: 'Receta no encontrada.' });
        return res.json(recipe);
    },
};
