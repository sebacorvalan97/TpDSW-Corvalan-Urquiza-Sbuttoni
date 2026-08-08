"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ingredientController = void 0;
const ingredient_repository_js_1 = require("../repositories/ingredient.repository.js");
exports.ingredientController = {
    getAllIngredients: (req, res) => {
        const ingredients = ingredient_repository_js_1.ingredientRepository.getAllIngredients();
        res.json(ingredients);
    },
    createIngredient: (req, res) => {
        const { nombre, descripcion } = req.body;
        const newIngredient = ingredient_repository_js_1.ingredientRepository.createIngredient(nombre, descripcion);
        res.status(201).json(newIngredient);
    },
    updateIngredient: (req, res) => {
        const idIngredient = parseInt(req.params.id);
        const newData = req.body;
        const ingredient = ingredient_repository_js_1.ingredientRepository.updateIngredient(idIngredient, newData);
        if (ingredient) {
            res.json(ingredient);
        }
        else {
            res.status(404).json({ message: 'Ingrediente no encontrado' });
        }
    },
    deleteIngredient: (req, res) => {
        const idIngredient = parseInt(req.params.id);
        const ingredient = ingredient_repository_js_1.ingredientRepository.deleteIngredient(idIngredient);
        if (ingredient) {
            res.json({ message: 'Ingrediente eliminado correctamente' });
        }
        else {
            res.status(404).json({ message: 'Ingrediente no encontrado' });
        }
    },
    getIngredientById: (req, res) => {
        const idIngredient = parseInt(req.params.id);
        const ingredient = ingredient_repository_js_1.ingredientRepository.getIngredientById(idIngredient);
        if (ingredient) {
            res.json(ingredient);
        }
        else {
            res.status(404).json({ message: 'Ingrediente no encontrado' });
        }
    }
};
//# sourceMappingURL=ingredient.controller.js.map