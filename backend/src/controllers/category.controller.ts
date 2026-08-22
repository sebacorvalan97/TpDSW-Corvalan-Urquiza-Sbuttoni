import { Request, Response } from "express";
import { categoryRepository } from "../shared/repositories/category.repository.js";

export const categoryController = {
    getAllCategories: (req: Request, res: Response) => {
        const categories = categoryRepository.getAllCategories();
        res.json(categories);
    },
    
    createCategory: (req: Request, res: Response) => {
        const { nombre, descripcion } = req.body;
        const newCategory = categoryRepository.createCategory(nombre, descripcion);
        res.status(201).json(newCategory);
    },
    
    updateCategory: (req: Request, res: Response) => {
        const idCategory = parseInt(req.params.id as string);
        const newData = req.body;
        const category = categoryRepository.updateCategory(idCategory, newData);

        if (category) {
            res.json(category);
        } else {
            res.status(404).json({ message: 'Categoría no encontrada' });
        }
    },
    
    deleteCategory: (req: Request, res: Response) => {
        const idCategory = parseInt(req.params.id as string);
        const category = categoryRepository.deleteCategory(idCategory);

        if (category) {
            res.json({ message: 'Categoría eliminada correctamente' });
        } else {
            res.status(404).json({ message: 'Categoría no encontrada' });
        }
    },
    
    getCategoryById: (req: Request, res: Response) => {
        const idCategory = parseInt(req.params.id as string);
        const category = categoryRepository.getCategoryById(idCategory);

        if (category) {
            res.json(category);
        } else {
            res.status(404).json({ message: 'Categoría no encontrada' });
        }
    }
};
