import { Router } from 'express';
import { recipeCatalogController } from '../controllers/recipe-catalog.controller.js';
import { requireAdmin } from '../middleware/auth.js';

export const recipeCatalogRouter = Router();

recipeCatalogRouter.get('/origins', recipeCatalogController.getOrigins);
recipeCatalogRouter.get('/origins/:id', recipeCatalogController.getOriginById);
recipeCatalogRouter.get('/origins/:id/recipes', recipeCatalogController.getRecipesByOrigin);
recipeCatalogRouter.get('/difficulties', recipeCatalogController.getDifficulties);
recipeCatalogRouter.get('/difficulties/:id', recipeCatalogController.getDifficultyById);
recipeCatalogRouter.post('/origins', requireAdmin, recipeCatalogController.createOrigin);
recipeCatalogRouter.put('/origins/:id', requireAdmin, recipeCatalogController.updateOrigin);
recipeCatalogRouter.delete('/origins/:id', requireAdmin, recipeCatalogController.deleteOrigin);
recipeCatalogRouter.post('/difficulties', requireAdmin, recipeCatalogController.createDifficulty);
recipeCatalogRouter.put('/difficulties/:id', requireAdmin, recipeCatalogController.updateDifficulty);
recipeCatalogRouter.delete('/difficulties/:id', requireAdmin, recipeCatalogController.deleteDifficulty);
