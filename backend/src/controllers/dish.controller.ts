import { Request, Response } from 'express';
import { dishRepository } from '../shared/repositories/dish.repository.js';

export const dishController = {
  getAllDishes: async (_req: Request, res: Response) => {
    const dishes = await dishRepository.getAllDishes();
    res.json(dishes);
  },

  createDish: async (req: Request, res: Response) => {
    const { name, description } = req.body;
    const newDish = await dishRepository.createDish(name, description);
    res.status(201).json(newDish);
  },

  updateDish: async (req: Request, res: Response) => {
    const idDish = parseInt(req.params.id as string);
    const newData = req.body;
    const dish = await dishRepository.updateDish(idDish, newData);

    if (dish) {
      res.json(dish);
    } else {
      res.status(404).json({ message: 'Plato no encontrado' });
    }
  },

  deleteDish: async (req: Request, res: Response) => {
    const idDish = parseInt(req.params.id as string);
    const dish = await dishRepository.deleteDish(idDish);

    if (dish) {
      res.json({ message: 'Plato eliminado correctamente' });
    } else {
      res.status(404).json({ message: 'Plato no encontrado' });
    }
  },

  getDishById: async (req: Request, res: Response) => {
    const idDish = parseInt(req.params.id as string);
    const dish = await dishRepository.getDishById(idDish);

    if (dish) {
      res.json(dish);
    } else {
      res.status(404).json({ message: 'Plato no encontrado' });
    }
  },
};
