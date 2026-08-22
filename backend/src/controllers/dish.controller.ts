import { Request, Response } from "express";
import { dishRepository } from "../shared/repositories/dish.repository.js";

export const dishController = {
    getAllDishes: (req: Request, res: Response) => {
        const dishes = dishRepository.getAllDishes();
        res.json(dishes);
    },

    createDish: (req: Request, res: Response) => {
        const { description, name } = req.body;
        const newDish = dishRepository.createDish(description, name);
        res.status(201).json(newDish);
    },

    updateDish: (req: Request, res: Response) => {
        const idDish = parseInt(req.params.id as string);
        const newData = req.body;
        const dish = dishRepository.updateDish(idDish, newData);

        if (dish) {
            res.json(dish);
        } else {
            res.status(404).json({ message: 'Dish not found' });
        }
    },

    deleteDish: (req: Request, res: Response) => {
        const idDish = parseInt(req.params.id as string);
        const dish = dishRepository.deleteDish(idDish);

        if (dish) {
            res.json({ message: 'Dish deleted' });
        } else {
            res.status(404).json({ message: 'Dish not found' });
        }
    },

    getDishById: (req: Request, res: Response) => {
        const idDish = parseInt(req.params.id as string);
        const dish = dishRepository.getDishById(idDish);

        if (dish) {
            res.json(dish);
        } else {
            res.status(404).json({ message: 'Dish not found' });
        }
    }
};
