/**
 * CAPA DE RUTAS de Ingredientes.
 * Asocia cada "verbo HTTP + URL" con la función del controlador que la atiende.
 * Como en app.ts se monta con app.use('/api/ingredients', ingredientRouter), las URLs finales son:
 *
 *   GET    /api/ingredients      → listar todos
 *   GET    /api/ingredients/:id  → ver uno
 *   POST   /api/ingredients      → crear
 *   PUT    /api/ingredients/:id  → modificar
 *   DELETE /api/ingredients/:id  → eliminar
 */
import { Router } from 'express';
import { ingredientController } from '../controllers/ingredient.controller.js';

export const ingredientRouter = Router();

ingredientRouter.get('/', ingredientController.getAllIngredients);
ingredientRouter.post('/', ingredientController.createIngredient);
ingredientRouter.put('/:id', ingredientController.updateIngredient);
ingredientRouter.delete('/:id', ingredientController.deleteIngredient);
ingredientRouter.get('/:id', ingredientController.getIngredientById);
