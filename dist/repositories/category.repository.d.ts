export interface Category {
    idCategory: number;
    nombre: string;
    descripcion: string;
}
export declare const categoryRepository: {
    getAllCategories: () => Category[];
    createCategory: (nombre: string, descripcion: string) => Category;
    updateCategory: (idCategory: number, newData: Partial<Category>) => Category | null;
    deleteCategory: (idCategory: number) => Category[] | null;
    getCategoryById: (idCategory: number) => Category | null;
};
//# sourceMappingURL=category.repository.d.ts.map