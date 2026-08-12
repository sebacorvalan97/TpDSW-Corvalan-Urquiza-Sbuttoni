import { Router } from 'express';
import { recipeController } from '../controllers/recipe.controller.js';

export const recipeRouter = Router();

recipeRouter.get('/', recipeController.getAllRecipes);
recipeRouter.post('/', recipeController.createRecipe);
recipeRouter.put('/:id', recipeController.updateRecipe);
recipeRouter.delete('/:id', recipeController.deleteRecipe);
recipeRouter.get('/:id', recipeController.getRecipeById);