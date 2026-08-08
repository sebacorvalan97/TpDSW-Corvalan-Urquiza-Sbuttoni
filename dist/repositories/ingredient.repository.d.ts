export interface Ingredient {
    idIngredient: number;
    nombre: string;
    descripcion: string;
}
export declare const ingredientRepository: {
    getAllIngredients: () => Ingredient[];
    createIngredient: (nombre: string, descripcion: string) => Ingredient;
    updateIngredient: (idIngredient: number, newData: Partial<Ingredient>) => Ingredient | null;
    deleteIngredient: (idIngredient: number) => Ingredient[] | null;
    getIngredientById: (idIngredient: number) => Ingredient | null;
};
//# sourceMappingURL=ingredient.repository.d.ts.map