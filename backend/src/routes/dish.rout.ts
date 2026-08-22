import { Router } from 'express';
import { dishController } from '../controllers/dish.controller.js';

export const dishRouter = Router();

dishRouter.get('/', dishController.getAllDishes);
dishRouter.post('/', dishController.createDish);
dishRouter.put('/:id', dishController.updateDish);
dishRouter.delete('/:id', dishController.deleteDish);
dishRouter.get('/:id', dishController.getDishById);