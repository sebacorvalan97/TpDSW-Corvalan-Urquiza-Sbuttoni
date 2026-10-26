import { Router } from 'express';
import { dishController } from '../controllers/dish.controller.js';
import { requireAdmin } from '../middleware/auth.js';

export const dishRouter = Router();

dishRouter.get('/', dishController.getAllDishes);
dishRouter.post('/', requireAdmin, dishController.createDish);
dishRouter.put('/:id', requireAdmin, dishController.updateDish);
dishRouter.delete('/:id', requireAdmin, dishController.deleteDish);
dishRouter.get('/:id', dishController.getDishById);
