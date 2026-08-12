import {createBrotliCompress} from "zlib";

export interface Category {
    idCategory: number;
    nombre: string;
    descripcion: string;
}

const categories: Category[] = [];
let idCurrentCategory = 1;

export const categoryRepository = {
    getAllCategories: () => {
       return categories; 
    },
    
    createCategory: (nombre: string, descripcion: string) => {
        const newCategory: Category = { idCategory: idCurrentCategory++, nombre, descripcion };
        categories.push(newCategory);
        return newCategory;
    },
    
    updateCategory: (idCategory: number, newData: Partial<Category>) => {
        const index = categories.findIndex(c => c.idCategory == idCategory);
        if (index !== -1) {
            categories[index] = { ...categories[index], ...newData } as Category;
            return categories[index];
        }
        return null;
    },
    
    deleteCategory: (idCategory: number) => {
        const index = categories.findIndex(c => c.idCategory == idCategory);
        if (index !== -1) {
            return categories.splice(index, 1);
        }
        return null;
    },
    
    getCategoryById: (idCategory: number) => {
        return categories.find(c => c.idCategory == idCategory) || null;
    }
};