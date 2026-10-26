import { prisma } from '../prisma.js';

export interface Dish {
    idDish: number;
    description: string;
    name: string;
}

const fromDatabase = (dish: {
    idPlato: number;
    descripcionReceta: string | null;
    nombre: string;
}): Dish => ({
    idDish: dish.idPlato,
    description: dish.descripcionReceta ?? '',
    name: dish.nombre,
});

export const dishRepository = {
    getAllDishes: async (): Promise<Dish[]> => {
        const dishes = await prisma.plato.findMany({ orderBy: { idPlato: 'asc' } });
        return dishes.map(fromDatabase);
    },

    createDish: async (name: string, description: string): Promise<Dish> => {
        const dish = await prisma.plato.create({
            data: { nombre: name, descripcionReceta: description },
        });
        return fromDatabase(dish);
    },

    updateDish: async (idDish: number, newData: Partial<Dish>): Promise<Dish | null> => {
        const updated = await prisma.plato.updateMany({
            where: { idPlato: idDish },
            data: {
                ...(newData.name === undefined ? {} : { nombre: newData.name }),
                ...(newData.description === undefined ? {} : { descripcionReceta: newData.description }),
            },
        });
        if (updated.count === 0) return null;
        const dish = await prisma.plato.findUnique({ where: { idPlato: idDish } });
        return dish ? fromDatabase(dish) : null;
    },

    deleteDish: async (idDish: number): Promise<boolean> => {
        const deleted = await prisma.plato.deleteMany({ where: { idPlato: idDish } });
        return deleted.count > 0;
    },

    getDishById: async (idDish: number): Promise<Dish | null> => {
        const dish = await prisma.plato.findUnique({ where: { idPlato: idDish } });
        return dish ? fromDatabase(dish) : null;
    },
};
