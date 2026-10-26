import type { Request, Response } from 'express';
import { HttpError } from '../shared/errors/http-error.js';
import { getSessionFromRequest } from '../middleware/auth.js';
import { userFeaturesRepository } from '../shared/repositories/user-features.repository.js';

const positiveId = (value: unknown, label: string): number => {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) throw new HttpError(400, `${label} no es válido.`);
    return parsed;
};

const userIdFromRequest = (req: Request): number => {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== 'user') throw new HttpError(401, 'Se requiere una sesión de usuario.');
    return session.id;
};

export const userFeaturesController = {
    getFavorites: async (req: Request, res: Response) => {
        res.json(await userFeaturesRepository.getFavoriteRecipeIds(userIdFromRequest(req)));
    },

    toggleFavorite: async (req: Request, res: Response) => {
        const isFavorite = await userFeaturesRepository.toggleFavorite(
            userIdFromRequest(req),
            positiveId(req.params.recipeId, 'El identificador de receta'),
        );
        res.json({ isFavorite });
    },

    getPantry: async (req: Request, res: Response) => {
        res.json(await userFeaturesRepository.getPantry(userIdFromRequest(req)));
    },

    setPantryItem: async (req: Request, res: Response) => {
        const userId = userIdFromRequest(req);
        const ingredientId = positiveId(req.body?.ingredientId, 'El identificador de ingrediente');
        const { cantidad, unidad } = req.body ?? {};
        if (typeof cantidad !== 'number' || !Number.isFinite(cantidad) || cantidad <= 0 ||
            typeof unidad !== 'string' || !unidad.trim()) {
            throw new HttpError(400, 'Indica una cantidad mayor que cero y una unidad.');
        }
        res.status(200).json(await userFeaturesRepository.setPantryItem(userId, ingredientId, cantidad, unidad.trim()));
    },

    removePantryItem: async (req: Request, res: Response) => {
        const removed = await userFeaturesRepository.removePantryItem(
            userIdFromRequest(req),
            positiveId(req.params.ingredientId, 'El identificador de ingrediente'),
        );
        if (!removed) return res.status(404).json({ message: 'El ingrediente no está en tu despensa.' });
        return res.status(204).send();
    },

    getSubstitutes: async (req: Request, res: Response) => {
        const rawId = req.params.ingredientId;
        const ingredientId = rawId === undefined ? undefined : positiveId(rawId, 'El identificador de ingrediente');
        res.json(await userFeaturesRepository.getSubstitutes(ingredientId));
    },

    createSubstitute: async (req: Request, res: Response) => {
        const { ingredientId, substituteId, proportion, notes } = req.body ?? {};
        const original = positiveId(ingredientId, 'El ingrediente original');
        const substitute = positiveId(substituteId, 'El ingrediente sustituto');
        if (original === substitute) throw new HttpError(400, 'Un ingrediente no puede sustituirse a sí mismo.');
        if (typeof proportion !== 'string' || !proportion.trim() || proportion.length > 100 ||
            (notes !== undefined && (typeof notes !== 'string' || notes.length > 200))) {
            throw new HttpError(400, 'Indica una proporción y notas de hasta 200 caracteres.');
        }
        res.status(201).json(await userFeaturesRepository.createSubstitute(
            original, substitute, proportion.trim(), typeof notes === 'string' ? notes.trim() : '',
        ));
    },

    deleteSubstitute: async (req: Request, res: Response) => {
        const removed = await userFeaturesRepository.deleteSubstitute(
            positiveId(req.params.ingredientId, 'El ingrediente original'),
            positiveId(req.params.substituteId, 'El ingrediente sustituto'),
        );
        if (!removed) return res.status(404).json({ message: 'El sustituto no existe.' });
        return res.status(204).send();
    },
};
