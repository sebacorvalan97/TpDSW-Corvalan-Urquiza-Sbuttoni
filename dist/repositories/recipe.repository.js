"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recipeRepository = void 0;
const recipes = [];
let idCurrentRecipe = 1;
exports.recipeRepository = {
    getAllRecipes: () => {
        return recipes;
    },
    createRecipe: (descripcion, duracion) => {
        const newRecipe = { idRecipe: idCurrentRecipe++, descripcion, duracion };
        recipes.push(newRecipe);
        return newRecipe;
    },
    updateRecipe: (idRecipe, newData) => {
        const index = recipes.findIndex(r => r.idRecipe == idRecipe);
        if (index !== -1) {
            recipes[index] = { ...recipes[index], ...newData };
            return recipes[index];
        }
        return null;
    },
    deleteRecipe: (idRecipe) => {
        const index = recipes.findIndex(r => r.idRecipe == idRecipe);
        if (index !== -1) {
            return recipes.splice(index, 1);
        }
        return null;
    },
    getRecipeById: (idRecipe) => {
        return recipes.find(r => r.idRecipe == idRecipe) || null;
    }
};
//# sourceMappingURL=recipe.repository.js.map