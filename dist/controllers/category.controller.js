"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryController = void 0;
const category_repository_js_1 = require("../repositories/category.repository.js");
exports.categoryController = {
    getAllCategories: (req, res) => {
        const categories = category_repository_js_1.categoryRepository.getAllCategories();
        res.json(categories);
    },
    createCategory: (req, res) => {
        const { nombre, descripcion } = req.body;
        const newCategory = category_repository_js_1.categoryRepository.createCategory(nombre, descripcion);
        res.status(201).json(newCategory);
    },
    updateCategory: (req, res) => {
        const idCategory = parseInt(req.params.id);
        const newData = req.body;
        const category = category_repository_js_1.categoryRepository.updateCategory(idCategory, newData);
        if (category) {
            res.json(category);
        }
        else {
            res.status(404).json({ message: 'Categoría no encontrada' });
        }
    },
    deleteCategory: (req, res) => {
        const idCategory = parseInt(req.params.id);
        const category = category_repository_js_1.categoryRepository.deleteCategory(idCategory);
        if (category) {
            res.json({ message: 'Categoría eliminada correctamente' });
        }
        else {
            res.status(404).json({ message: 'Categoría no encontrada' });
        }
    },
    getCategoryById: (req, res) => {
        const idCategory = parseInt(req.params.id);
        const category = category_repository_js_1.categoryRepository.getCategoryById(idCategory);
        if (category) {
            res.json(category);
        }
        else {
            res.status(404).json({ message: 'Categoría no encontrada' });
        }
    }
};
//# sourceMappingURL=category.controller.js.map