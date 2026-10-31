import type { Request, Response } from 'express';
import { recetaIngredienteRepository } from '../shared/repositories/receta-ingrediente.repository.js';
import { parseId } from '../shared/utils/parse-id.js';
import { HttpError } from '../shared/errors/http-error.js';
import { getSessionFromRequest } from '../middleware/auth.js';
import { assertCanManageRecipe } from '../shared/utils/recipe-authorization.js';

export const recetaIngredienteController = {
  getIngredientesByReceta: async (req: Request, res: Response) => {
    const recetaId = parseId(req.params.recetaId);
    const ingredientes = await recetaIngredienteRepository.getAllByRecetaId(recetaId);
    res.json(ingredientes);
  },

  addIngredienteToReceta: async (req: Request, res: Response) => {
    const recetaId = parseId(req.params.recetaId);
    const session = getSessionFromRequest(req);

    await assertCanManageRecipe(recetaId, session);

    const { ingredienteId, cantidad, unidad } = req.body ?? {};
    const idIngrediente = parseId(ingredienteId);

    if (typeof cantidad !== 'number' || !Number.isFinite(cantidad) || cantidad <= 0) {
      throw new HttpError(400, 'La cantidad debe ser un número positivo.');
    }
    if (typeof unidad !== 'string' || !unidad.trim()) {
      throw new HttpError(400, 'La unidad de medida es obligatoria.');
    }

    const newItem = await recetaIngredienteRepository.create(
      recetaId,
      idIngrediente,
      cantidad,
      unidad.trim(),
    );
    res.status(201).json(newItem);
  },

  removeIngredientesFromReceta: async (req: Request, res: Response) => {
    const recetaId = parseId(req.params.recetaId);
    const session = getSessionFromRequest(req);

    await assertCanManageRecipe(recetaId, session);

    await recetaIngredienteRepository.deleteByRecetaId(recetaId);
    res.json({ message: 'Ingredientes eliminados correctamente.' });
  },
};
