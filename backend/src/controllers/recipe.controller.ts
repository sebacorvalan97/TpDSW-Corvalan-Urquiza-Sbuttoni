import { Request, Response } from "express";
import { recipeRepository } from "../shared/repositories/recipe.repository.js";

export const recipeController = {
    getAllRecipes: (req: Request, res: Response) => {
        const recipes = recipeRepository.getAllRecipes();
        res.json(recipes);
    },
    
    createRecipe: (req: Request, res: Response) => {
        const { descripcion, duracion } = req.body;
        const newRecipe = recipeRepository.createRecipe(descripcion, duracion);
        res.status(201).json(newRecipe);
    },
    
    updateRecipe: (req: Request, res: Response) => {
        const idRecipe = parseInt(req.params.id as string);
        const newData = req.body;
        const recipe = recipeRepository.updateRecipe(idRecipe, newData);

        if (recipe) {
            res.json(recipe);
        } else {
            res.status(404).json({ message: 'Receta no encontrada' });
        }
    },
    
    deleteRecipe: (req: Request, res: Response) => {
        const idRecipe = parseInt(req.params.id as string);
        const recipe = recipeRepository.deleteRecipe(idRecipe);

        if (recipe) {
            res.json({ message: 'Receta eliminada correctamente' });
        } else {
            res.status(404).json({ message: 'Receta no encontrada' });
        }
    },
    
    getRecipeById: (req: Request, res: Response) => {
        const idRecipe = parseInt(req.params.id as string);
        const recipe = recipeRepository.getRecipeById(idRecipe);

        if (recipe) {
            res.json(recipe);
        } else {
            res.status(404).json({ message: 'Receta no encontrada' });
        }
    }
};
