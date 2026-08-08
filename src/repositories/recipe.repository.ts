import {createBrotliCompress} from "zlib";

export interface Recipe {
    idRecipe: number;
    descripcion: string;
    duracion: string;
}

const recipes: Recipe[] = [];
let idCurrentRecipe = 1;

export const recipeRepository = {
    getAllRecipes: () => {
       return recipes; 
    },
    
    createRecipe: (descripcion: string, duracion: string) => {
        const newRecipe: Recipe = { idRecipe: idCurrentRecipe++, descripcion, duracion };
        recipes.push(newRecipe);
        return newRecipe;
    },
    
    updateRecipe: (idRecipe: number, newData: Partial<Recipe>) => {
        const index = recipes.findIndex(r => r.idRecipe == idRecipe);
        if (index !== -1) {
            recipes[index] = { ...recipes[index], ...newData } as Recipe;
            return recipes[index];
        }
        return null;
    },
    
    deleteRecipe: (idRecipe: number) => {
        const index = recipes.findIndex(r => r.idRecipe == idRecipe);
        if (index !== -1) {
            return recipes.splice(index, 1);
        }
        return null;
    },
    
    getRecipeById: (idRecipe: number) => {
        return recipes.find(r => r.idRecipe == idRecipe) || null;
    }
};