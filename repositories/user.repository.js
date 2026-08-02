"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = void 0;
// Nuestra "base de datos" temporal (array de con datos de nuestros usuarios)
const users = [];
let idCurrent = 1;
// Objeto encargado de manejar los datos, nuestro "repositorio" 
exports.userRepository = {
    getAllUsers: () => {
        return users;
    },
    //funcion crear usuario
    createUser: (name, mail) => {
        const newUser = { id: idCurrent++, name, mail };
        users.push(newUser); //agrega valores a nuestra clase user y los guarsa al final de nuestro "repositorio" temporal
        return newUser;
    },
    //Funcion actualizar datos de usuario
    updateUser: (id, newData) => {
        const index = users.findIndex(u => u.id == id);
        if (index != -1) {
            users[index] = { ...users[index], ...newData };
            //Agregamos un as User para forzar el tipo de dato, 
            //porque ts retorna error por no cumplir la interfaz User, 
            // debido a que User se encuentra vacio.
            return users[index]; //retorna el usuario
        }
        return null; //Si no encuentra al usuario retona null
    },
    deleteUser: (id) => {
        const index = users.findIndex(u => u.id == id);
        if (index !== -1) {
            return users.splice(index, 1); // El metodo splice elimina el elemento 
        }
        return null;
    },
    // Busca y devuelve el usuario, o null si no lo encuentra
    getUserById: (id) => {
        return users.find(u => u.id === id) || null;
    }
};
//# sourceMappingURL=user.repository.js.map