"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recipeController = void 0;
const recipe_repository_js_1 = require("../repositories/recipe.repository.js");
exports.recipeController = {
    getAllRecipes: (req, res) => {
        const recipes = recipe_repository_js_1.recipeRepository.getAllRecipes();
        res.json(recipes);
    },
    createRecipe: (req, res) => {
        const { descripcion, duracion } = req.body;
        const newRecipe = recipe_repository_js_1.recipeRepository.createRecipe(descripcion, duracion);
        res.status(201).json(newRecipe);
    },
    updateRecipe: (req, res) => {
        const idRecipe = parseInt(req.params.id);
        const newData = req.body;
        const recipe = recipe_repository_js_1.recipeRepository.updateRecipe(idRecipe, newData);
        if (recipe) {
            res.json(recipe);
        }
        else {
            res.status(404).json({ message: 'Receta no encontrada' });
        }
    },
    deleteRecipe: (req, res) => {
        const idRecipe = parseInt(req.params.id);
        const recipe = recipe_repository_js_1.recipeRepository.deleteRecipe(idRecipe);
        if (recipe) {
            res.json({ message: 'Receta eliminada correctamente' });
        }
        else {
            res.status(404).json({ message: 'Receta no encontrada' });
        }
    },
    getRecipeById: (req, res) => {
        const idRecipe = parseInt(req.params.id);
        const recipe = recipe_repository_js_1.recipeRepository.getRecipeById(idRecipe);
        if (recipe) {
            res.json(recipe);
        }
        else {
            res.status(404).json({ message: 'Receta no encontrada' });
        }
    }
};
//# sourceMappingURL=recipe.controller.js.map