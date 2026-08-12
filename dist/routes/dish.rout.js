"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dishRouter = void 0;
const express_1 = require("express");
const dish_controller_js_1 = require("../controllers/dish.controller.js");
exports.dishRouter = (0, express_1.Router)();
exports.dishRouter.get('/', dish_controller_js_1.dishController.getAllDishes);
exports.dishRouter.post('/', dish_controller_js_1.dishController.createDish);
exports.dishRouter.put('/:id', dish_controller_js_1.dishController.updateDish);
exports.dishRouter.delete('/:id', dish_controller_js_1.dishController.deleteDish);
exports.dishRouter.get('/:id', dish_controller_js_1.dishController.getDishById);
//# sourceMappingURL=dish.rout.js.map