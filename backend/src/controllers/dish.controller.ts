import { Request, Response } from 'express';
import { dishRepository } from '../shared/repositories/dish.repository.js';

export const dishController = {
  getAllDishes: (req: Request, res: Response) => {
    const dishes = dishRepository.getAllDishes();
    res.json(dishes);
  },

  createDish: (req: Request, res: Response) => {
    const { name, description } = req.body;
    const newDish = dishRepository.createDish(name, description);
    res.status(201).json(newDish);
  },

  updateDish: (req: Request, res: Response) => {
    const idDish = parseInt(req.params.id as string);
    const newData = req.body;
    const dish = dishRepository.updateDish(idDish, newData);

    if (dish) {
      res.json(dish);
    } else {
      res.status(404).json({ message: 'Plato no encontrado' });
    }
  },

  deleteDish: (req: Request, res: Response) => {
    const idDish = parseInt(req.params.id as string);
    const dish = dishRepository.deleteDish(idDish);

    if (dish) {
      res.json({ message: 'Plato eliminado correctamente' });
    } else {
      res.status(404).json({ message: 'Plato no encontrado' });
    }
  },

  getDishById: (req: Request, res: Response) => {
    const idDish = parseInt(req.params.id as string);
    const dish = dishRepository.getDishById(idDish);

    if (dish) {
      res.json(dish);
    } else {
      res.status(404).json({ message: 'Plato no encontrado' });
    }
  },
};
