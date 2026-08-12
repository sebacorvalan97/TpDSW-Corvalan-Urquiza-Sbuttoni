"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const user_repository_js_1 = require("../repositories/user.repository.js");
exports.userController = {
    getAllUsers: (req, res) => {
        const users = user_repository_js_1.userRepository.getAllUsers();
        res.json(users);
    },
    createUser: (req, res) => {
        const { name, birth, password, state, mail } = req.body;
        const newUser = user_repository_js_1.userRepository.createUser(name, birth, password, state, mail);
        res.status(201).json(newUser);
    },
    updateUser: (req, res) => {
        const idUser = parseInt(req.params.id);
        const newData = req.body;
        const user = user_repository_js_1.userRepository.updateUser(idUser, newData);
        if (user) {
            res.json(user);
        }
        else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    },
    deleteUser: (req, res) => {
        const idUser = parseInt(req.params.id);
        const user = user_repository_js_1.userRepository.deleteUser(idUser);
        if (user) {
            res.json({ message: 'Usuario eliminado correctamente' });
        }
        else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    },
    getUserById: (req, res) => {
        const idUser = parseInt(req.params.id);
        const user = user_repository_js_1.userRepository.getUserById(idUser);
        if (user) {
            res.json(user);
        }
        else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    }
};
//# sourceMappingURL=user.controller.js.map