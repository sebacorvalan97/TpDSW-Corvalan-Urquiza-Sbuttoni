"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = void 0;
const users = [];
let idCurrentUser = 1;
exports.userRepository = {
    getAllUsers: () => {
        return users;
    },
    createUser: (name, birth, password, state, mail) => {
        const newUser = { idUser: idCurrentUser++, name, birth, password, state, mail };
        users.push(newUser);
        return newUser;
    },
    updateUser: (idUser, newData) => {
        const index = users.findIndex(u => u.idUser == idUser);
        if (index !== -1) {
            users[index] = { ...users[index], ...newData };
            return users[index];
        }
        return null;
    },
    deleteUser: (idUser) => {
        const index = users.findIndex(u => u.idUser == idUser);
        if (index !== -1) {
            return users.splice(index, 1);
        }
        return null;
    },
    getUserById: (idUser) => {
        return users.find(u => u.idUser == idUser) || null;
    }
};
//# sourceMappingURL=user.repository.js.map