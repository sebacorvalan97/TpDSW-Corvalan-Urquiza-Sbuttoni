import type { Request, Response } from 'express';
import { dishRepository } from '../shared/repositories/dish.repository.js';
import { parseId } from '../shared/utils/parse-id.js';
import { HttpError } from '../shared/errors/http-error.js';

export const dishController = {
  getAllDishes: async (_req: Request, res: Response) => {
    const dishes = await dishRepository.getAllDishes();
    res.json(dishes);
  },

  createDish: async (req: Request, res: Response) => {
    const { name, description } = req.body ?? {};
    if (typeof name !== 'string' || !name.trim() || name.trim().length > 200) {
      throw new HttpError(400, 'El nombre del plato es obligatorio (hasta 200 caracteres).');
    }
    if (description !== undefined && (typeof description !== 'string' || description.length > 2000)) {
      throw new HttpError(400, 'La descripción del plato no puede superar los 2000 caracteres.');
    }

    const newDish = await dishRepository.createDish(
      name.trim(),
      typeof description === 'string' ? description.trim() : '',
    );
    res.status(201).json(newDish);
  },

  updateDish: async (req: Request, res: Response) => {
    const idDish = parseId(req.params.id);
    const { name, description } = req.body ?? {};

    if (name !== undefined && (typeof name !== 'string' || !name.trim() || name.trim().length > 200)) {
      throw new HttpError(400, 'El nombre del plato debe ser un texto de hasta 200 caracteres.');
    }
    if (description !== undefined && (typeof description !== 'string' || description.length > 2000)) {
      throw new HttpError(400, 'La descripción del plato no puede superar los 2000 caracteres.');
    }

    const dish = await dishRepository.updateDish(idDish, {
      ...(name !== undefined ? { name: name.trim() } : {}),
      ...(description !== undefined ? { description: description.trim() } : {}),
    });

    if (dish) {
      res.json(dish);
    } else {
      throw new HttpError(404, 'Plato no encontrado');
    }
  },

  deleteDish: async (req: Request, res: Response) => {
    const idDish = parseId(req.params.id);
    const dish = await dishRepository.deleteDish(idDish);

    if (dish) {
      res.json({ message: 'Plato eliminado correctamente' });
    } else {
      throw new HttpError(404, 'Plato no encontrado');
    }
  },

  getDishById: async (req: Request, res: Response) => {
    const idDish = parseId(req.params.id);
    const dish = await dishRepository.getDishById(idDish);

    if (dish) {
      res.json(dish);
    } else {
      throw new HttpError(404, 'Plato no encontrado');
    }
  },
};
