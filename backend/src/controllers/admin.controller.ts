import { Request, Response } from "express";
import { adminRepository } from "../shared/repositories/admin.repository.js";
import { createSession, destroySession, getSessionFromRequest, getTokenFromRequest } from "../middleware/requireAdmin.js";
import { isActiveAccountState } from "../shared/utils/account-status.js";

export const adminController = {
    login: async (req: Request, res: Response) => {
        const { mail, password } = req.body ?? {};
        if (typeof mail !== "string" || typeof password !== "string" || !mail || !password) {
            return res.status(400).json({ message: "Mail y contraseña son obligatorios" });
        }
        const admin = await adminRepository.authenticate(mail.trim(), password);
        if (!admin) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }
        res.json({ token: createSession({ role: "admin", id: admin.idAdmin }), admin });
    },

    logout: (req: Request, res: Response) => {
        const token = getTokenFromRequest(req);
        if (token) destroySession(token);
        res.json({ message: "Sesión cerrada" });
    },

    getCurrentAdmin: async (req: Request, res: Response) => {
        const session = getSessionFromRequest(req);
        if (!session || session.role !== "admin") {
            return res.status(401).json({ message: "Sesión de administrador no válida." });
        }
        const admin = await adminRepository.getAdminById(session.id);
        if (!admin || !isActiveAccountState(admin.state)) {
            return res.status(401).json({ message: "La cuenta de administrador ya no está activa." });
        }
        return res.json(admin);
    },

    getAllAdmins: async (_req: Request, res: Response) => {
        res.json(await adminRepository.getAllAdmins());
    },

    getAdminById: async (req: Request, res: Response) => {
        const admin = await adminRepository.getAdminById(parseInt(req.params.id as string));
        if (!admin) return res.status(404).json({ message: "Administrador no encontrado" });
        res.json(admin);
    },

    createAdmin: async (req: Request, res: Response) => {
        const { name, mail, password, state } = req.body ?? {};
        if (!name || !mail || !password) {
            return res.status(400).json({ message: "Nombre, mail y contraseña son obligatorios" });
        }
        if (await adminRepository.mailExists(mail)) {
            return res.status(409).json({ message: "Ya existe un administrador con ese mail" });
        }
        res.status(201).json(await adminRepository.createAdmin(name, mail, password, state ?? "active"));
    },

    updateAdmin: async (req: Request, res: Response) => {
        const idAdmin = parseInt(req.params.id as string);
        const { name, mail, password, state } = req.body ?? {};
        if (mail && await adminRepository.mailExists(mail, idAdmin)) {
            return res.status(409).json({ message: "Ya existe un administrador con ese mail" });
        }
        const admin = await adminRepository.updateAdmin(idAdmin, { name, mail, password, state });
        if (!admin) return res.status(404).json({ message: "Administrador no encontrado" });
        res.json(admin);
    },

    deleteAdmin: async (req: Request, res: Response) => {
        const idAdmin = parseInt(req.params.id as string);
        if (await adminRepository.count() <= 1) {
            return res.status(400).json({ message: "No se puede eliminar al único administrador" });
        }
        if (!await adminRepository.deleteAdmin(idAdmin)) {
            return res.status(404).json({ message: "Administrador no encontrado" });
        }
        res.json({ message: "Administrador eliminado correctamente" });
    },
};
