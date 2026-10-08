/**
 * CAPA DE RUTAS de Categorías.
 * Asocia cada "verbo HTTP + URL" con la función del controlador que la atiende.
 * Como en app.ts se monta con app.use('/api/categories', categoryRouter), las URLs finales son:
 *
 *   GET    /api/categories      → listar todas
 *   GET    /api/categories/:id  → ver una
 *   POST   /api/categories      → crear
 *   PUT    /api/categories/:id  → modificar
 *   DELETE /api/categories/:id  → eliminar
 */
import { Router } from 'express';
import { categoryController } from '../controllers/category.controller.js';

export const categoryRouter = Router();

categoryRouter.get('/', categoryController.getAllCategories);
categoryRouter.post('/', categoryController.createCategory);
categoryRouter.put('/:id', categoryController.updateCategory);
categoryRouter.delete('/:id', categoryController.deleteCategory);
categoryRouter.get('/:id', categoryController.getCategoryById);
