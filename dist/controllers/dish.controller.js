"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dishController = void 0;
const dish_repository_js_1 = require("../repositories/dish.repository.js");
exports.dishController = {
    getAllDishes: (req, res) => {
        const dishes = dish_repository_js_1.dishRepository.getAllDishes();
        res.json(dishes);
    },
    createDish: (req, res) => {
        const { description, name } = req.body;
        const newDish = dish_repository_js_1.dishRepository.createDish(description, name);
        res.status(201).json(newDish);
    },
    updateDish: (req, res) => {
        const idDish = parseInt(req.params.id);
        const newData = req.body;
        const dish = dish_repository_js_1.dishRepository.updateDish(idDish, newData);
        if (dish) {
            res.json(dish);
        }
        else {
            res.status(404).json({ message: 'Dish not found' });
        }
    },
    deleteDish: (req, res) => {
        const idDish = parseInt(req.params.id);
        const dish = dish_repository_js_1.dishRepository.deleteDish(idDish);
        if (dish) {
            res.json({ message: 'Dish deleted' });
        }
        else {
            res.status(404).json({ message: 'Dish not found' });
        }
    },
    getDishById: (req, res) => {
        const idDish = parseInt(req.params.id);
        const dish = dish_repository_js_1.dishRepository.getDishById(idDish);
        if (dish) {
            res.json(dish);
        }
        else {
            res.status(404).json({ message: 'Dish not found' });
        }
    }
};
//# sourceMappingURL=dish.controller.js.map