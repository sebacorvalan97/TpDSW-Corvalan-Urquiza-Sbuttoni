/**
 * CAPA DE RUTAS de Ingredientes Sustitutos.
 * Asocia cada "verbo HTTP + URL" con la función del controlador que la atiende.
 * Se monta con app.use('/api/ingredients/:ingredientId/substitutes', substituteIngredientRouter),
 * y utiliza mergeParams: true para poder acceder al parámetro :ingredientId definido en la ruta padre.
 *
 * Las URLs finales son:
 *   GET    /api/ingredients/:ingredientId/substitutes      → listar todos los sustitutos de un ingrediente
 *   GET    /api/ingredients/:ingredientId/substitutes/:id  → ver un sustituto
 *   POST   /api/ingredients/:ingredientId/substitutes      → crear un sustituto
 *   PUT    /api/ingredients/:ingredientId/substitutes/:id  → modificar un sustituto
 *   DELETE /api/ingredients/:ingredientId/substitutes/:id  → eliminar un sustituto
 */
import { Router } from 'express';
import { substituteIngredientController } from '../controllers/substitute-ingredient.controller.js';

export const substituteIngredientRouter: Router = Router({ mergeParams: true });

substituteIngredientRouter.get('/', substituteIngredientController.getAllSubstitutes);
substituteIngredientRouter.post('/', substituteIngredientController.createSubstitute);
substituteIngredientRouter.put('/:id', substituteIngredientController.updateSubstitute);
substituteIngredientRouter.delete('/:id', substituteIngredientController.deleteSubstitute);
substituteIngredientRouter.get('/:id', substituteIngredientController.getSubstituteById);
