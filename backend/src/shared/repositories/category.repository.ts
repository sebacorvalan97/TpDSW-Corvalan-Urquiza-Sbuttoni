import { prisma } from '../prisma.js';

export interface Category {
    idCategory: number;
    nombre: string;
    descripcion: string;
}

export type CategoryInput = Omit<Category, 'idCategory'>;

const fromDatabase = (category: {
    idCategoria: number;
    nombreCategoria: string;
    descripcion: string;
}): Category => ({
    idCategory: category.idCategoria,
    nombre: category.nombreCategoria,
    descripcion: category.descripcion,
});

export const categoryRepository = {
    getAllCategories: async (): Promise<Category[]> => {
        const categories = await prisma.categoria.findMany({ orderBy: { idCategoria: 'asc' } });
        return categories.map(fromDatabase);
    },

    getCategoryById: async (idCategory: number): Promise<Category | null> => {
        const category = await prisma.categoria.findUnique({ where: { idCategoria: idCategory } });
        return category ? fromDatabase(category) : null;
    },

    getCategoryByName: async (nombre: string): Promise<Category | null> => {
        const category = await prisma.categoria.findUnique({ where: { nombreCategoria: nombre } });
        return category ? fromDatabase(category) : null;
    },

    createCategory: async (data: CategoryInput): Promise<Category> => {
        const category = await prisma.categoria.create({
            data: { nombreCategoria: data.nombre, descripcion: data.descripcion },
        });
        return fromDatabase(category);
    },

    updateCategory: async (idCategory: number, data: CategoryInput): Promise<Category | null> => {
        const updated = await prisma.categoria.updateMany({
            where: { idCategoria: idCategory },
            data: { nombreCategoria: data.nombre, descripcion: data.descripcion },
        });
        return updated.count === 0 ? null : categoryRepository.getCategoryById(idCategory);
    },

    deleteCategory: async (idCategory: number): Promise<boolean> => {
        const deleted = await prisma.categoria.deleteMany({ where: { idCategoria: idCategory } });
        return deleted.count > 0;
    },
};
