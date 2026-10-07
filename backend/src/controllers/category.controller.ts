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

export const categoryController = {
    // GET /api/categories → lista todas
    getAllCategories: (_req: Request, res: Response) => {
        res.json(categoryService.getAll());
    },

    // GET /api/categories/:id → una sola
    getCategoryById: (req: Request, res: Response) => {
        res.json(categoryService.getById(req.params.id));
    },

    // POST /api/categories → crea. Responde 201 (Created) con la categoría nueva.
    createCategory: (req: Request, res: Response) => {
        const created = categoryService.create(req.body);
        res.status(201).json(created);
    },

    // PUT /api/categories/:id → modifica
    updateCategory: (req: Request, res: Response) => {
        res.json(categoryService.update(req.params.id, req.body));
    },

    // DELETE /api/categories/:id → elimina. Responde 204 (No Content): salió bien, sin cuerpo.
    deleteCategory: (req: Request, res: Response) => {
        categoryService.remove(req.params.id);
        res.status(204).send();
    },
};
