import { Request, Response } from 'express';
import { pasoRecetaRepository } from '../shared/repositories/paso-receta.repository.js';

export const pasoRecetaController = {
  getAllPasos: async (_req: Request, res: Response) => {
    const pasos = await pasoRecetaRepository.getAllPasos();
    res.json(pasos);
  },

  createPaso: async (req: Request, res: Response) => {
    const { recetaId, numeroOrden, descripcion } = req.body;
    const newPaso = await pasoRecetaRepository.createPaso(
      recetaId,
      numeroOrden,
      descripcion,
    );
    res.status(201).json(newPaso);
  },

  updatePaso: async (req: Request, res: Response) => {
    const idPaso = parseInt(req.params.id as string);
    const newData = req.body;
    const paso = await pasoRecetaRepository.updatePaso(idPaso, newData);

    if (paso) {
      res.json(paso);
    } else {
      res.status(404).json({ message: 'Paso no encontrado' });
    }
  },

  deletePaso: async (req: Request, res: Response) => {
    const idPaso = parseInt(req.params.id as string);
    const paso = await pasoRecetaRepository.deletePaso(idPaso);

    if (paso) {
      res.json({ message: 'Paso eliminado correctamente' });
    } else {
      res.status(404).json({ message: 'Paso no encontrado' });
    }
  },

  getPasoById: async (req: Request, res: Response) => {
    const idPaso = parseInt(req.params.id as string);
    const paso = await pasoRecetaRepository.getPasoById(idPaso);

    if (paso) {
      res.json(paso);
    } else {
      res.status(404).json({ message: 'Paso no encontrado' });
    }
  },
};
