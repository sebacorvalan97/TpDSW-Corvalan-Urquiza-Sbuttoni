"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ingredientRepository = void 0;
const ingredients = [];
let idCurrentIngredient = 1;
exports.ingredientRepository = {
    getAllIngredients: () => {
        return ingredients;
    },
    createIngredient: (nombre, descripcion) => {
        const newIngredient = { idIngredient: idCurrentIngredient++, nombre, descripcion };
        ingredients.push(newIngredient);
        return newIngredient;
    },
    updateIngredient: (idIngredient, newData) => {
        const index = ingredients.findIndex(i => i.idIngredient == idIngredient);
        if (index !== -1) {
            ingredients[index] = { ...ingredients[index], ...newData };
            return ingredients[index];
        }
        return null;
    },
    deleteIngredient: (idIngredient) => {
        const index = ingredients.findIndex(i => i.idIngredient == idIngredient);
        if (index !== -1) {
            return ingredients.splice(index, 1);
        }
        return null;
    },
    getIngredientById: (idIngredient) => {
        return ingredients.find(i => i.idIngredient == idIngredient) || null;
    }
};
//# sourceMappingURL=ingredient.repository.js.map