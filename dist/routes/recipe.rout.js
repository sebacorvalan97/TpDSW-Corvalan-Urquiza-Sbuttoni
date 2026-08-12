"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recipeRouter = void 0;
const express_1 = require("express");
const recipe_controller_js_1 = require("../controllers/recipe.controller.js");
exports.recipeRouter = (0, express_1.Router)();
exports.recipeRouter.get('/', recipe_controller_js_1.recipeController.getAllRecipes);
exports.recipeRouter.post('/', recipe_controller_js_1.recipeController.createRecipe);
exports.recipeRouter.put('/:id', recipe_controller_js_1.recipeController.updateRecipe);
exports.recipeRouter.delete('/:id', recipe_controller_js_1.recipeController.deleteRecipe);
exports.recipeRouter.get('/:id', recipe_controller_js_1.recipeController.getRecipeById);
//# sourceMappingURL=recipe.rout.js.map