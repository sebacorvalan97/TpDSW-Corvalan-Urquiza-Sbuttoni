import { Router } from 'express';
import { recetaIngredienteController } from '../controllers/receta-ingrediente.controller.js';

export const recetaIngredienteRouter = Router();

recetaIngredienteRouter.get(
  '/:recetaId',
  recetaIngredienteController.getIngredientesByReceta,
);
recetaIngredienteRouter.post(
  '/:recetaId',
  recetaIngredienteController.addIngredienteToReceta,
);
recetaIngredienteRouter.delete(
  '/:recetaId',
  recetaIngredienteController.removeIngredientesFromReceta,
);
