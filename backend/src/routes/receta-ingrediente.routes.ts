import { Router } from 'express';
import { recetaIngredienteController } from '../controllers/receta-ingrediente.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const recetaIngredienteRouter = Router();

recetaIngredienteRouter.get(
  '/:recetaId',
  recetaIngredienteController.getIngredientesByReceta,
);
recetaIngredienteRouter.post(
  '/:recetaId',
  requireAuth,
  recetaIngredienteController.addIngredienteToReceta,
);
recetaIngredienteRouter.delete(
  '/:recetaId',
  requireAuth,
  recetaIngredienteController.removeIngredientesFromReceta,
);
