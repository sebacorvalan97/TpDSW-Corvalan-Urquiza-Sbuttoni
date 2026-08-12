import { Router } from 'express';
import { ingredientController } from '../controllers/ingredient.controller.js';

export const ingredientRouter = Router();

ingredientRouter.get('/', ingredientController.getAllIngredients);
ingredientRouter.post('/', ingredientController.createIngredient);
ingredientRouter.put('/:id', ingredientController.updateIngredient);
ingredientRouter.delete('/:id', ingredientController.deleteIngredient);
ingredientRouter.get('/:id', ingredientController.getIngredientById);