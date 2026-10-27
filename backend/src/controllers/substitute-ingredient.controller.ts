/**
 * CAPA DE CONTROLADOR (Controller) de Ingredientes Sustitutos.
 *
 * Es el "traductor" entre HTTP y nuestro código: toma lo que llega en la petición
 * (req.params.ingredientId, req.params.id, req.body), se lo pasa al servicio y arma la respuesta (status + JSON).
 * NO tiene reglas de negocio: eso es trabajo del servicio.
 *
 * Los errores no se capturan acá: si el servicio lanza un HttpError, Express (v5) lo
 * envía solo al middleware de errores (middlewares/error-handler.ts).
 */
import type { Request, Response } from 'express';
import { substituteIngredientService } from '../services/substitute-ingredient.service.js';

export const substituteIngredientController = {
    // GET /api/ingredients/:ingredientId/substitutes → lista todos los sustitutos del ingrediente
    getAllSubstitutes: async (req: Request, res: Response) => {
        res.json(await substituteIngredientService.getAll(req.params.ingredientId));
    },

    // GET /api/ingredients/:ingredientId/substitutes/:id → uno solo
    getSubstituteById: async (req: Request, res: Response) => {
        res.json(await substituteIngredientService.getById(req.params.ingredientId, req.params.id));
    },

    // POST /api/ingredients/:ingredientId/substitutes → crea. Responde 201 (Created) con el sustituto nuevo.
    createSubstitute: async (req: Request, res: Response) => {
        const created = await substituteIngredientService.create(req.params.ingredientId, req.body);
        res.status(201).json(created);
    },

    // PUT /api/ingredients/:ingredientId/substitutes/:id → modifica
    updateSubstitute: async (req: Request, res: Response) => {
        res.json(await substituteIngredientService.update(req.params.ingredientId, req.params.id, req.body));
    },

    // DELETE /api/ingredients/:ingredientId/substitutes/:id → elimina. Responde 204 (No Content): salió bien, sin cuerpo.
    deleteSubstitute: async (req: Request, res: Response) => {
        await substituteIngredientService.remove(req.params.ingredientId, req.params.id);
        res.status(204).send();
    },
};
