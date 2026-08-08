"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dishRepository = void 0;
const dishes = [];
let idCurrentDish = 1;
exports.dishRepository = {
    getAllDishes: () => {
        return dishes;
    },
    createDish: (description, name) => {
        const newDish = { idDish: idCurrentDish++, description, name };
        dishes.push(newDish);
        return newDish;
    },
    updateDish: (idDish, newData) => {
        const index = dishes.findIndex(d => d.idDish == idDish);
        if (index !== -1) {
            dishes[index] = { ...dishes[index], ...newData };
            return dishes[index];
        }
        return null;
    },
    deleteDish: (idDish) => {
        const index = dishes.findIndex(d => d.idDish == idDish);
        if (index !== -1) {
            return dishes.splice(index, 1);
        }
        return null;
    },
    getDishById: (idDish) => {
        return dishes.find(d => d.idDish == idDish) || null;
    }
};
//# sourceMappingURL=dish.repository.js.map