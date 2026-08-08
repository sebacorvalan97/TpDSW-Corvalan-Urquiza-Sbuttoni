"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryRouter = void 0;
const express_1 = require("express");
const category_controller_js_1 = require("../controllers/category.controller.js");
exports.categoryRouter = (0, express_1.Router)();
exports.categoryRouter.get('/', category_controller_js_1.categoryController.getAllCategories);
exports.categoryRouter.post('/', category_controller_js_1.categoryController.createCategory);
exports.categoryRouter.put('/:id', category_controller_js_1.categoryController.updateCategory);
exports.categoryRouter.delete('/:id', category_controller_js_1.categoryController.deleteCategory);
exports.categoryRouter.get('/:id', category_controller_js_1.categoryController.getCategoryById);
//# sourceMappingURL=category.rout.js.map