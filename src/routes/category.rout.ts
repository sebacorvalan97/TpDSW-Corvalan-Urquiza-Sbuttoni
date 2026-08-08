import { Router } from 'express';
import { categoryController } from '../controllers/category.controller.js';

export const categoryRouter = Router();

categoryRouter.get('/', categoryController.getAllCategories);
categoryRouter.post('/', categoryController.createCategory);
categoryRouter.put('/:id', categoryController.updateCategory);
categoryRouter.delete('/:id', categoryController.deleteCategory);
categoryRouter.get('/:id', categoryController.getCategoryById);