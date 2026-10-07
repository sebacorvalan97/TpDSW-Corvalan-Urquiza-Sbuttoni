import { Request, Response } from 'express';
import { pasoRecetaRepository } from '../shared/repositories/paso-receta.repository.js';

export const pasoRecetaController = {
  getAllPasos: (req: Request, res: Response) => {
    const pasos = pasoRecetaRepository.getAllPasos();
    res.json(pasos);
  },

  createPaso: (req: Request, res: Response) => {
    const { recetaId, numeroOrden, descripcion } = req.body;
    const newPaso = pasoRecetaRepository.createPaso(
      recetaId,
      numeroOrden,
      descripcion,
    );
    res.status(201).json(newPaso);
  },

  updatePaso: (req: Request, res: Response) => {
    const idPaso = parseInt(req.params.id as string);
    const newData = req.body;
    const paso = pasoRecetaRepository.updatePaso(idPaso, newData);

    if (paso) {
      res.json(paso);
    } else {
      res.status(404).json({ message: 'Paso no encontrado' });
    }
  },

  deletePaso: (req: Request, res: Response) => {
    const idPaso = parseInt(req.params.id as string);
    const paso = pasoRecetaRepository.deletePaso(idPaso);

    if (paso) {
      res.json({ message: 'Paso eliminado correctamente' });
    } else {
      res.status(404).json({ message: 'Paso no encontrado' });
    }
  },

  getPasoById: (req: Request, res: Response) => {
    const idPaso = parseInt(req.params.id as string);
    const paso = pasoRecetaRepository.getPasoById(idPaso);

    if (paso) {
      res.json(paso);
    } else {
      res.status(404).json({ message: 'Paso no encontrado' });
    }
  },
};
