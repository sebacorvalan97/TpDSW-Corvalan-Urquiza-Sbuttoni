"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const user_controller_js_1 = require("../controllers/user.controller.js"); // <-- Sin llaves { }
exports.userRouter = (0, express_1.Router)();
// Ruta para obtener todos los usuarios (GET)
exports.userRouter.get('/', user_controller_js_1.userController.getAllUsers);
// Ruta para crear un nuevo usuario (POST)
exports.userRouter.post('/', user_controller_js_1.userController.createUser);
//Ruta para actualizar un ususario (PUT)
exports.userRouter.put('/:id', user_controller_js_1.userController.updateUser);
//Ruta para elminar un susario (DELETE)
exports.userRouter.delete('/:id', user_controller_js_1.userController.deleteUser);
//Ruta para buscar un usuario por id (GET)
exports.userRouter.get('/:id', user_controller_js_1.userController.getUserById);
//# sourceMappingURL=user.rout.js.map