import { Router } from 'express';
import { pasoRecetaController } from '../controllers/paso-receta.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const pasoRecetaRouter = Router();

pasoRecetaRouter.get('/', pasoRecetaController.getAllPasos);
pasoRecetaRouter.post('/', requireAuth, pasoRecetaController.createPaso);
pasoRecetaRouter.put('/:id', requireAuth, pasoRecetaController.updatePaso);
pasoRecetaRouter.delete('/:id', requireAuth, pasoRecetaController.deletePaso);
pasoRecetaRouter.get('/:id', pasoRecetaController.getPasoById);
