export interface Ingredient {
    idIngredient: number;
    nombre: string;
    descripcion: string;
}

const ingredients: Ingredient[] = [];
let idCurrentIngredient = 1;

export const ingredientRepository = {
    getAllIngredients: () => {
       return ingredients; 
    },
    
    createIngredient: (nombre: string, descripcion: string) => {
        const newIngredient: Ingredient = { idIngredient: idCurrentIngredient++, nombre, descripcion };
        ingredients.push(newIngredient);
        return newIngredient;
    },
    
    updateIngredient: (idIngredient: number, newData: Partial<Ingredient>) => {
        const index = ingredients.findIndex(i => i.idIngredient == idIngredient);
        if (index !== -1) {
            ingredients[index] = { ...ingredients[index], ...newData } as Ingredient;
            return ingredients[index];
        }
        return null;
    },
    
    deleteIngredient: (idIngredient: number) => {
        const index = ingredients.findIndex(i => i.idIngredient == idIngredient);
        if (index !== -1) {
            return ingredients.splice(index, 1);
        }
        return null;
    },
    
    getIngredientById: (idIngredient: number) => {
        return ingredients.find(i => i.idIngredient == idIngredient) || null;
    }
};