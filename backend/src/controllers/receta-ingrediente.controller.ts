import { Request, Response } from 'express';
import { recetaIngredienteRepository } from '../shared/repositories/receta-ingrediente.repository.js';

export const recetaIngredienteController = {
  getIngredientesByReceta: async (req: Request, res: Response) => {
    const recetaId = parseInt(req.params.recetaId as string);
    const ingredientes = await recetaIngredienteRepository.getAllByRecetaId(recetaId);
    res.json(ingredientes);
  },

  addIngredienteToReceta: async (req: Request, res: Response) => {
    const recetaId = parseInt(req.params.recetaId as string);
    const { ingredienteId, cantidad, unidad } = req.body;
    const newItem = await recetaIngredienteRepository.create(
      recetaId,
      ingredienteId,
      cantidad,
      unidad,
    );
    res.status(201).json(newItem);
  },

  removeIngredientesFromReceta: async (req: Request, res: Response) => {
    const recetaId = parseInt(req.params.recetaId as string);
    await recetaIngredienteRepository.deleteByRecetaId(recetaId);
    res.json({ message: 'Ingredientes eliminados' });
  },
};
