/**
 * CAPA DE RUTAS de Ingredientes Sustitutos.
 * Montado en app.ts.
 *
 * Las URLs son:
 *   GET    /api/ingredients/:ingredientId/substitutes      → listar todos los sustitutos de un ingrediente
 *   GET    /api/ingredients/:ingredientId/substitutes/:id  → ver un sustituto
 *   POST   /api/ingredients/:ingredientId/substitutes      → crear un sustituto
 *   PUT    /api/ingredients/:ingredientId/substitutes/:id  → modificar un sustituto
 *   DELETE /api/ingredients/:ingredientId/substitutes/:id  → eliminar un sustituto
 */
import { Router } from 'express';
import { substituteIngredientController } from '../controllers/substitute-ingredient.controller.js';
import { requireAdmin } from '../middleware/auth.js';

export const substituteIngredientRouter: Router = Router();

substituteIngredientRouter.get('/api/ingredients/:ingredientId/substitutes', substituteIngredientController.getAllSubstitutes);
substituteIngredientRouter.post('/api/ingredients/:ingredientId/substitutes', requireAdmin, substituteIngredientController.createSubstitute);
substituteIngredientRouter.put('/api/ingredients/:ingredientId/substitutes/:id', requireAdmin, substituteIngredientController.updateSubstitute);
substituteIngredientRouter.delete('/api/ingredients/:ingredientId/substitutes/:id', requireAdmin, substituteIngredientController.deleteSubstitute);
substituteIngredientRouter.get('/api/ingredients/:ingredientId/substitutes/:id', substituteIngredientController.getSubstituteById);
