export interface Recipe {
    idRecipe: number;
    descripcion: string;
    duracion: string;
}
export declare const recipeRepository: {
    getAllRecipes: () => Recipe[];
    createRecipe: (descripcion: string, duracion: string) => Recipe;
    updateRecipe: (idRecipe: number, newData: Partial<Recipe>) => Recipe | null;
    deleteRecipe: (idRecipe: number) => Recipe[] | null;
    getRecipeById: (idRecipe: number) => Recipe | null;
};
//# sourceMappingURL=recipe.repository.d.ts.map