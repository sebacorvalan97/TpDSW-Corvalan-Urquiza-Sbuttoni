/**
 * CAPA DE CONTROLADOR (Controller) de Ingredientes.
 *
 * Es el "traductor" entre HTTP y nuestro código: toma lo que llega en la petición
 * (req.params, req.body), se lo pasa al servicio y arma la respuesta (status + JSON).
 * NO tiene reglas de negocio: eso es trabajo del servicio.
 *
 * Los errores no se capturan acá: si el servicio lanza un HttpError, Express (v5) lo
 * envía solo al middleware de errores (middlewares/error-handler.ts).
 */
import type { Request, Response } from 'express';
import { ingredientService } from '../services/ingredient.service.js';

export const ingredientController = {
    // GET /api/ingredients → lista todos
    getAllIngredients: async (_req: Request, res: Response) => {
        res.json(await ingredientService.getAll());
    },

    // GET /api/ingredients/:id → uno solo
    getIngredientById: async (req: Request, res: Response) => {
        res.json(await ingredientService.getById(req.params.id));
    },

    // POST /api/ingredients → crea. Responde 201 (Created) con el ingrediente nuevo.
    createIngredient: async (req: Request, res: Response) => {
        const created = await ingredientService.create(req.body);
        res.status(201).json(created);
    },

    // PUT /api/ingredients/:id → modifica
    updateIngredient: async (req: Request, res: Response) => {
        res.json(await ingredientService.update(req.params.id, req.body));
    },

    // DELETE /api/ingredients/:id → elimina. Responde 204 (No Content): salió bien, sin cuerpo.
    deleteIngredient: async (req: Request, res: Response) => {
        await ingredientService.remove(req.params.id);
        res.status(204).send();
    },
};
