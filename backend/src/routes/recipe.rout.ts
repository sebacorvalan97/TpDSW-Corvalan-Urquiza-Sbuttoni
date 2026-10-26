import { Router } from 'express';
import { recipeController } from '../controllers/recipe.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const recipeRouter = Router();

recipeRouter.get('/', recipeController.getAllRecipes);
recipeRouter.post('/', requireAuth, recipeController.createRecipe);
recipeRouter.put('/:id', requireAuth, recipeController.updateRecipe);
recipeRouter.delete('/:id', requireAuth, recipeController.deleteRecipe);
recipeRouter.get('/:id', recipeController.getRecipeById);