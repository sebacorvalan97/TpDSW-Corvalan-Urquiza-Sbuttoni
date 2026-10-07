import { Router } from 'express';
import { pasoRecetaController } from '../controllers/paso-receta.controller.js';

export const pasoRecetaRouter = Router();

pasoRecetaRouter.get('/', pasoRecetaController.getAllPasos);
pasoRecetaRouter.post('/', pasoRecetaController.createPaso);
pasoRecetaRouter.put('/:id', pasoRecetaController.updatePaso);
pasoRecetaRouter.delete('/:id', pasoRecetaController.deletePaso);
pasoRecetaRouter.get('/:id', pasoRecetaController.getPasoById);
