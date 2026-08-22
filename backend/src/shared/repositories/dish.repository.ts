import {createBrotliCompress} from "zlib";

export interface Dish {
    idDish: number;
    description: string;
    name: string;
}

const dishes: Dish[] = [];
let idCurrentDish = 1;

export const dishRepository = {
    getAllDishes: () => {
       return dishes; 
    },

    createDish: (description: string, name: string) => {
        const newDish: Dish = { idDish: idCurrentDish++, description, name };
        dishes.push(newDish);
        return newDish;
    },

    updateDish: (idDish: number, newData: Partial<Dish>) => {
        const index = dishes.findIndex(d => d.idDish == idDish);
        if (index !== -1) {
            dishes[index] = { ...dishes[index], ...newData } as Dish;
            return dishes[index];
        }
        return null;
    },

    deleteDish: (idDish: number) => {
        const index = dishes.findIndex(d => d.idDish == idDish);
        if (index !== -1) {
            return dishes.splice(index, 1);
        }
        return null;
    },

    getDishById: (idDish: number) => {
        return dishes.find(d => d.idDish == idDish) || null;
    }
};