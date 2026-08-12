"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryRepository = void 0;
const categories = [];
let idCurrentCategory = 1;
exports.categoryRepository = {
    getAllCategories: () => {
        return categories;
    },
    createCategory: (nombre, descripcion) => {
        const newCategory = { idCategory: idCurrentCategory++, nombre, descripcion };
        categories.push(newCategory);
        return newCategory;
    },
    updateCategory: (idCategory, newData) => {
        const index = categories.findIndex(c => c.idCategory == idCategory);
        if (index !== -1) {
            categories[index] = { ...categories[index], ...newData };
            return categories[index];
        }
        return null;
    },
    deleteCategory: (idCategory) => {
        const index = categories.findIndex(c => c.idCategory == idCategory);
        if (index !== -1) {
            return categories.splice(index, 1);
        }
        return null;
    },
    getCategoryById: (idCategory) => {
        return categories.find(c => c.idCategory == idCategory) || null;
    }
};
//# sourceMappingURL=category.repository.js.map