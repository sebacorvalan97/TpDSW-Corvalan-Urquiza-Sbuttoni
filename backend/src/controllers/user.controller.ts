import { Request, Response } from "express";
import { userRepository } from "../shared/repositories/user.repository.js";

export const userController = {
    getAllUsers: (req: Request, res: Response) => {
        const users = userRepository.getAllUsers();
        res.json(users);
    },
    
    createUser: (req: Request, res: Response) => {
        const { name, birth, password, state, mail } = req.body;
        const newUser = userRepository.createUser(name, birth, password, state, mail);
        res.status(201).json(newUser);
    },
    
    updateUser: (req: Request, res: Response) => {
        const idUser = parseInt(req.params.id as string);
        const newData = req.body;
        const user = userRepository.updateUser(idUser, newData);

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    },
    
    deleteUser: (req: Request, res: Response) => {
        const idUser = parseInt(req.params.id as string);
        const user = userRepository.deleteUser(idUser);

        if (user) {
            res.json({ message: 'Usuario eliminado correctamente' });
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    },
    
    getUserById: (req: Request, res: Response) => {
        const idUser = parseInt(req.params.id as string);
        const user = userRepository.getUserById(idUser);

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    }
};
