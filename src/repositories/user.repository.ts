import {createBrotliCompress} from "zlib";

export interface User {
    idUser: number;
    name: string;
    birth: string;
    password: string;
    state: string;
    mail: string;
}

const users: User[] = [];
let idCurrentUser = 1;

export const userRepository = {
    getAllUsers: () => {
       return users; 
    },
    
    createUser: (name: string, birth: string, password: string, state: string, mail: string) => {
        const newUser: User = { idUser: idCurrentUser++, name, birth, password, state, mail };
        users.push(newUser);
        return newUser;
    },
    
    updateUser: (idUser: number, newData: Partial<User>) => {
        const index = users.findIndex(u => u.idUser == idUser);
        if (index !== -1) {
            users[index] = { ...users[index], ...newData } as User;
            return users[index];
        }
        return null;
    },
    
    deleteUser: (idUser: number) => {
        const index = users.findIndex(u => u.idUser == idUser);
        if (index !== -1) {
            return users.splice(index, 1);
        }
        return null;
    },
    
    getUserById: (idUser: number) => {
        return users.find(u => u.idUser == idUser) || null;
    }
};