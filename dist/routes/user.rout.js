"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const user_controller_js_1 = require("../controllers/user.controller.js");
exports.userRouter = (0, express_1.Router)();
exports.userRouter.get('/', user_controller_js_1.userController.getAllUsers);
exports.userRouter.post('/', user_controller_js_1.userController.createUser);
exports.userRouter.put('/:id', user_controller_js_1.userController.updateUser);
exports.userRouter.delete('/:id', user_controller_js_1.userController.deleteUser);
exports.userRouter.get('/:id', user_controller_js_1.userController.getUserById);
//# sourceMappingURL=user.rout.js.map