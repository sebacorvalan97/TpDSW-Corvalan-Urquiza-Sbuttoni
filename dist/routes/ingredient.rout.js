"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ingredientRouter = void 0;
const express_1 = require("express");
const ingredient_controller_js_1 = require("../controllers/ingredient.controller.js");
exports.ingredientRouter = (0, express_1.Router)();
exports.ingredientRouter.get('/', ingredient_controller_js_1.ingredientController.getAllIngredients);
exports.ingredientRouter.post('/', ingredient_controller_js_1.ingredientController.createIngredient);
exports.ingredientRouter.put('/:id', ingredient_controller_js_1.ingredientController.updateIngredient);
exports.ingredientRouter.delete('/:id', ingredient_controller_js_1.ingredientController.deleteIngredient);
exports.ingredientRouter.get('/:id', ingredient_controller_js_1.ingredientController.getIngredientById);
//# sourceMappingURL=ingredient.rout.js.map