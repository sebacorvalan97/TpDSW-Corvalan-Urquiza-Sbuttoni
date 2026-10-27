import { Request, Response } from "express";
import { userRepository } from "../shared/repositories/user.repository.js";
import { createSession, destroySession, getSessionFromRequest, getTokenFromRequest } from "../middleware/auth.js";
import { isActiveAccountState } from "../shared/utils/account-status.js";

export const userController = {
    login: async (req: Request, res: Response) => {
        const { mail, password } = req.body ?? {};
        if (typeof mail !== "string" || typeof password !== "string" || !mail || !password) {
            return res.status(400).json({ message: "Correo y contraseña son obligatorios." });
        }
        const result = await userRepository.authenticate(mail.trim(), password);
        if (!result) return res.status(401).json({ message: "Credenciales inválidas." });
        if (result.status === "inactive") {
            return res.status(401).json({ message: "Tu cuenta está inactiva. No puedes iniciar sesión." });
        }
        const user = result.user;
        return res.json({ token: createSession({ role: "user", id: user.idUser }), user });
    },

    logout: (req: Request, res: Response) => {
        const token = getTokenFromRequest(req);
        if (token) destroySession(token);
        return res.json({ message: "Sesión cerrada." });
    },

    getCurrentUser: async (req: Request, res: Response) => {
        const session = getSessionFromRequest(req);
        if (!session || session.role !== "user") {
            return res.status(401).json({ message: "Sesión de usuario no válida." });
        }
        const user = await userRepository.getById(session.id);
        if (!user || !isActiveAccountState(user.state)) {
            return res.status(401).json({ message: "La cuenta ya no está activa." });
        }
        return res.json(user);
    },

    getAllUsers: async (_req: Request, res: Response) => {
        const users = await userRepository.getAllUsers();
        res.json(users);
    },
    
    createUser: async (req: Request, res: Response) => {
        const { name, birth, password, mail, bio } = req.body ?? {};
        if (
            typeof name !== 'string' || !name.trim() ||
            typeof mail !== 'string' || !mail.trim() ||
            typeof password !== 'string' || password.length < 8
        ) {
            return res.status(400).json({ message: 'Nombre, correo y contraseña (mínimo 8 caracteres) son obligatorios.' });
        }
        if (await userRepository.mailExists(mail.trim())) {
            return res.status(409).json({ message: 'Ya existe un usuario con ese correo electrónico.' });
        }
        const newUser = await userRepository.createUser(
            name.trim(),
            typeof birth === 'string' ? birth : '',
            password,
            'activo',
            mail.trim(),
            typeof bio === 'string' ? bio.trim() : '',
        );
        return res.status(201).json({
            token: createSession({ role: "user", id: newUser.idUser }),
            user: newUser,
        });
    },
    
    updateUser: async (req: Request, res: Response) => {
        const idUser = parseInt(req.params.id as string);
        const { name, birth, password, state, mail, bio } = req.body ?? {};
        if (
            (name !== undefined && typeof name !== "string") ||
            (birth !== undefined && typeof birth !== "string") ||
            (password !== undefined && (typeof password !== "string" || password.length < 8)) ||
            (state !== undefined && state !== "activo" && state !== "inactivo") ||
            (mail !== undefined && typeof mail !== "string") ||
            (bio !== undefined && typeof bio !== "string")
        ) {
            return res.status(400).json({ message: "Los datos enviados para actualizar el usuario no son válidos." });
        }
        if (typeof mail === "string" && await userRepository.mailExists(mail.trim(), idUser)) {
            return res.status(409).json({ message: "Ya existe un usuario con ese correo electrónico." });
        }
        const newData = { name, birth, password, state, mail, bio };
        const user = await userRepository.updateUser(idUser, newData);

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    },
    
    deleteUser: async (req: Request, res: Response) => {
        const idUser = parseInt(req.params.id as string);
        const user = await userRepository.deleteUser(idUser);

        if (user) {
            res.json({ message: 'Usuario eliminado correctamente' });
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    },
    
    getUserById: async (req: Request, res: Response) => {
        const idUser = parseInt(req.params.id as string);
        const user = await userRepository.getUserById(idUser);

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    }
};
