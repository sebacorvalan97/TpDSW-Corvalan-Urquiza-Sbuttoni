import type { Request, Response } from 'express';
import { HttpError } from '../shared/errors/http-error.js';
import { getSessionFromRequest } from '../middleware/auth.js';
import { commentRepository } from '../shared/repositories/comment.repository.js';

const positiveId = (value: unknown, label: string): number => {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) throw new HttpError(400, `${label} no es válido.`);
    return parsed;
};

export const commentController = {
    getByRecipe: async (req: Request, res: Response) => {
        const session = getSessionFromRequest(req);
        res.json(await commentRepository.getByRecipe(
            positiveId(req.params.recipeId, 'El identificador de receta'),
            session?.role === 'user' ? session.id : undefined,
        ));
    },

    create: async (req: Request, res: Response) => {
        const session = getSessionFromRequest(req);
        if (!session || session.role !== 'user') throw new HttpError(401, 'Inicia sesión como usuario para comentar.');
        const { rating, text } = req.body ?? {};
        if (!Number.isInteger(rating) || rating < 1 || rating > 5 ||
            typeof text !== 'string' || !text.trim() || text.trim().length > 2000) {
            throw new HttpError(400, 'Escribe un comentario de hasta 2000 caracteres y califica entre 1 y 5.');
        }
        res.status(201).json(await commentRepository.create(
            positiveId(req.params.recipeId, 'El identificador de receta'),
            session.id,
            rating,
            text.trim(),
        ));
    },

    toggleLike: async (req: Request, res: Response) => {
        const session = getSessionFromRequest(req);
        if (!session || session.role !== 'user') throw new HttpError(401, 'Inicia sesión como usuario para reaccionar.');
        res.json(await commentRepository.toggleLike(
            positiveId(req.params.commentId, 'El identificador de comentario'),
            session.id,
        ));
    },
};
