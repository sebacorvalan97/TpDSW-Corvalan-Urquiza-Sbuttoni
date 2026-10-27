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
    getAllSubstitutes: (req: Request, res: Response) => {
        res.json(substituteIngredientService.getAll(req.params.ingredientId));
    },

    // GET /api/ingredients/:ingredientId/substitutes/:id → uno solo
    getSubstituteById: (req: Request, res: Response) => {
        res.json(substituteIngredientService.getById(req.params.ingredientId, req.params.id));
    },

    // POST /api/ingredients/:ingredientId/substitutes → crea. Responde 201 (Created) con el sustituto nuevo.
    createSubstitute: (req: Request, res: Response) => {
        const created = substituteIngredientService.create(req.params.ingredientId, req.body);
        res.status(201).json(created);
    },

    // PUT /api/ingredients/:ingredientId/substitutes/:id → modifica
    updateSubstitute: (req: Request, res: Response) => {
        res.json(substituteIngredientService.update(req.params.ingredientId, req.params.id, req.body));
    },

    // DELETE /api/ingredients/:ingredientId/substitutes/:id → elimina. Responde 204 (No Content): salió bien, sin cuerpo.
    deleteSubstitute: (req: Request, res: Response) => {
        substituteIngredientService.remove(req.params.ingredientId, req.params.id);
        res.status(204).send();
    },
};
