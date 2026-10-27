/**
 * CAPA DE CONTROLADOR (Controller) de Categorías.
 *
 * Es el "traductor" entre HTTP y nuestro código: toma lo que llega en la petición
 * (req.params, req.body), se lo pasa al servicio y arma la respuesta (status + JSON).
 * NO tiene reglas de negocio: eso es trabajo del servicio.
 *
 * Los errores no se capturan acá: si el servicio lanza un HttpError, Express (v5) lo
 * envía solo al middleware de errores (middlewares/error-handler.ts).
 */
import type { Request, Response } from 'express';
import { categoryService } from '../services/category.service.js';
import { recipeRepository } from '../shared/repositories/recipe.repository.js';
import { HttpError } from '../shared/errors/http-error.js';

export const categoryController = {
    // GET /api/categories → lista todas
    getAllCategories: async (_req: Request, res: Response) => {
        res.json(await categoryService.getAll());
    },

    // GET /api/categories/:id → una sola
    getCategoryById: async (req: Request, res: Response) => {
        res.json(await categoryService.getById(req.params.id));
    },

    // GET /api/categories/:id/recipes → listado de recetas de esta categoría
    getRecipesByCategory: async (req: Request, res: Response) => {
        const idCategory = Number(req.params.id);
        if (!Number.isInteger(idCategory) || idCategory <= 0) {
            throw new HttpError(400, 'El identificador de categoría no es válido.');
        }
        await categoryService.getById(idCategory);
        const recipes = await recipeRepository.getAllRecipes({ categoryId: idCategory });
        res.json(recipes);
    },

    // POST /api/categories → crea. Responde 201 (Created) con la categoría nueva.
    createCategory: async (req: Request, res: Response) => {
        const created = await categoryService.create(req.body);
        res.status(201).json(created);
    },

    // PUT /api/categories/:id → modifica
    updateCategory: async (req: Request, res: Response) => {
        res.json(await categoryService.update(req.params.id, req.body));
    },

    // DELETE /api/categories/:id → elimina. Responde 204 (No Content): salió bien, sin cuerpo.
    deleteCategory: async (req: Request, res: Response) => {
        await categoryService.remove(req.params.id);
        res.status(204).send();
    },
};
