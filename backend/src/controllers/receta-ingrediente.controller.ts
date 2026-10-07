import { Request, Response } from 'express';
import { recetaIngredienteRepository } from '../shared/repositories/receta-ingrediente.repository.js';

export const recetaIngredienteController = {
  getIngredientesByReceta: (req: Request, res: Response) => {
    const recetaId = parseInt(req.params.recetaId as string);
    const ingredientes = recetaIngredienteRepository.getAllByRecetaId(recetaId);
    res.json(ingredientes);
  },

  addIngredienteToReceta: (req: Request, res: Response) => {
    const recetaId = parseInt(req.params.recetaId as string);
    const { ingredienteId, cantidad, unidad } = req.body;
    const newItem = recetaIngredienteRepository.create(
      recetaId,
      ingredienteId,
      cantidad,
      unidad,
    );
    res.status(201).json(newItem);
  },

  removeIngredientesFromReceta: (req: Request, res: Response) => {
    const recetaId = parseInt(req.params.recetaId as string);
    recetaIngredienteRepository.deleteByRecetaId(recetaId);
    res.json({ message: 'Ingredientes eliminados' });
  },
};
