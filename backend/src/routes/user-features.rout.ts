import { Router } from 'express';
import { requireAdmin, requireUser } from '../middleware/auth.js';
import { userFeaturesController } from '../controllers/user-features.controller.js';

export const userFeaturesRouter = Router();

userFeaturesRouter.get('/favorites', requireUser, userFeaturesController.getFavorites);
userFeaturesRouter.post('/favorites/:recipeId', requireUser, userFeaturesController.toggleFavorite);
userFeaturesRouter.get('/pantry', requireUser, userFeaturesController.getPantry);
userFeaturesRouter.put('/pantry', requireUser, userFeaturesController.setPantryItem);
userFeaturesRouter.delete('/pantry/:ingredientId', requireUser, userFeaturesController.removePantryItem);
userFeaturesRouter.get('/substitutes', userFeaturesController.getSubstitutes);
userFeaturesRouter.get('/ingredients/:ingredientId/substitutes', userFeaturesController.getSubstitutes);
userFeaturesRouter.post('/substitutes', requireAdmin, userFeaturesController.createSubstitute);
userFeaturesRouter.delete('/substitutes/:ingredientId/:substituteId', requireAdmin, userFeaturesController.deleteSubstitute);
