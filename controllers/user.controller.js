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
        const { name, mail } = req.body;
        const newUser = user_repository_js_1.userRepository.createUser(name, mail);
        res.status(201).json(newUser);
    },
    //request para que el usuario envíe la info al servidor
    //response es la herramienta que el servidor utiliza para constestar, 
    // donde enviamos el resultado de vuelta al usuario
    updateUser: (req, res) => {
        //buscamos el id de la URL y lo convertimos a numero
        //mediante la req.params.id sacamos el numero id 
        // y los datos que se van a modificar en formato JSON
        const id = parseInt(req.params.id);
        const newData = req.body;
        const updateUser = user_repository_js_1.userRepository.updateUser(id, newData);
        if (updateUser) {
            res.json(updateUser); //retorna el usuario actualizado
        }
        else {
            res.status(404).json({ message: 'User not found' });
        }
    },
    deleteUser: (req, res) => {
        const id = parseInt(req.params.id);
        const deleteUser = user_repository_js_1.userRepository.deleteUser(id);
        if (deleteUser) {
            res.json({ message: 'User deleted successfully', user: deleteUser });
        }
        else {
            res.status(404).json({ message: 'User not found' });
        }
    },
    getUserById: (req, res) => {
        const id = parseInt(req.params.id);
        const user = user_repository_js_1.userRepository.getUserById(id);
        if (user) {
            res.json(user);
        }
        else {
            res.status(404).json({ message: 'User not found' });
        }
    }
};
//# sourceMappingURL=user.controller.js.map