import { Request, Response } from "express";
import { ingredientRepository } from "../shared/repositories/ingredient.repository.js";

export const ingredientController = {
    getAllIngredients: (req: Request, res: Response) => {
        const ingredients = ingredientRepository.getAllIngredients();
        res.json(ingredients);
    },
    
    createIngredient: (req: Request, res: Response) => {
        const { nombre, descripcion } = req.body;
        const newIngredient = ingredientRepository.createIngredient(nombre, descripcion);
        res.status(201).json(newIngredient);
    },
    
    updateIngredient: (req: Request, res: Response) => {
        const idIngredient = parseInt(req.params.id as string);
        const newData = req.body;
        const ingredient = ingredientRepository.updateIngredient(idIngredient, newData);

        if (ingredient) {
            res.json(ingredient);
        } else {
            res.status(404).json({ message: 'Ingrediente no encontrado' });
        }
    },
    
    deleteIngredient: (req: Request, res: Response) => {
        const idIngredient = parseInt(req.params.id as string);
        const ingredient = ingredientRepository.deleteIngredient(idIngredient);

        if (ingredient) {
            res.json({ message: 'Ingrediente eliminado correctamente' });
        } else {
            res.status(404).json({ message: 'Ingrediente no encontrado' });
        }
    },
    
    getIngredientById: (req: Request, res: Response) => {
        const idIngredient = parseInt(req.params.id as string);
        const ingredient = ingredientRepository.getIngredientById(idIngredient);

        if (ingredient) {
            res.json(ingredient);
        } else {
            res.status(404).json({ message: 'Ingrediente no encontrado' });
        }
    }
};
