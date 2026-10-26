import { randomUUID } from "crypto";
import type { NextFunction, Request, Response } from "express";
import { adminRepository } from "../shared/repositories/admin.repository.js";
import { userRepository } from "../shared/repositories/user.repository.js";
import { isActiveAccountState } from "../shared/utils/account-status.js";

export type AuthenticatedPrincipal = {
    role: "user" | "admin";
    id: number;
};

const sessions = new Map<string, AuthenticatedPrincipal>();

export const createSession = (principal: AuthenticatedPrincipal): string => {
    const token = randomUUID();
    sessions.set(token, principal);
    return token;
};

export const getTokenFromRequest = (req: Request): string | null => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) return null;
    return header.slice("Bearer ".length);
};

export const getSessionFromRequest = (req: Request): AuthenticatedPrincipal | null => {
    const token = getTokenFromRequest(req);
    return token ? sessions.get(token) ?? null : null;
};

export const destroySession = (token: string): void => {
    sessions.delete(token);
};

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const session = getSessionFromRequest(req);
    const identity = session?.role === "admin"
        ? await adminRepository.getAdminById(session.id)
        : session?.role === "user"
            ? await userRepository.getById(session.id)
            : null;
    if (!session || !identity || !isActiveAccountState(identity.state)) {
        res.status(401).json({ message: "Inicia sesión para realizar esta acción." });
        return;
    }
    next();
};

export const requireUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const session = getSessionFromRequest(req);
    const user = session?.role === "user" ? await userRepository.getById(session.id) : null;
    if (!user || !isActiveAccountState(user.state)) {
        res.status(401).json({ message: "Se requiere una sesión de usuario activa." });
        return;
    }
    next();
};

export const requireAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const session = getSessionFromRequest(req);
    const admin = session?.role === "admin" ? await adminRepository.getAdminById(session.id) : null;
    if (!admin || !isActiveAccountState(admin.state)) {
        res.status(403).json({ message: "Se requiere una sesión de administrador." });
        return;
    }
    next();
};
