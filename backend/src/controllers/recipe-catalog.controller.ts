import type { Request, Response } from 'express';
import { recipeCatalogRepository } from '../shared/repositories/recipe-catalog.repository.js';
import { recipeRepository } from '../shared/repositories/recipe.repository.js';
import { HttpError } from '../shared/errors/http-error.js';

const positiveId = (value: unknown): number => {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'El identificador del catálogo no es válido.');
    return id;
};

const textField = (value: unknown, label: string, max: number): string => {
    if (typeof value !== 'string' || !value.trim() || value.trim().length > max) {
        throw new HttpError(400, `${label} es obligatorio y debe tener hasta ${max} caracteres.`);
    }
    return value.trim();
};

export const recipeCatalogController = {
    getOrigins: async (_req: Request, res: Response) => {
        const origins = await recipeCatalogRepository.getOrigins();
        res.json(origins.map((origin) => ({
            idOrigin: origin.idOrigen,
            nombre: origin.nombreOrigen,
            pais: origin.paisReferencia,
        })));
    },

    getOriginById: async (req: Request, res: Response) => {
        const origin = await recipeCatalogRepository.getOriginById(positiveId(req.params.id));
        if (!origin) return res.status(404).json({ message: 'Origen no encontrado.' });
        return res.json({
            idOrigin: origin.idOrigen,
            nombre: origin.nombreOrigen,
            pais: origin.paisReferencia,
        });
    },

    getRecipesByOrigin: async (req: Request, res: Response) => {
        const idOrigin = positiveId(req.params.id);
        const origin = await recipeCatalogRepository.getOriginById(idOrigin);
        if (!origin) return res.status(404).json({ message: 'Origen no encontrado.' });
        const recipes = await recipeRepository.getAllRecipes({ originId: idOrigin });
        return res.json(recipes);
    },

    getDifficulties: async (_req: Request, res: Response) => {
        const difficulties = await recipeCatalogRepository.getDifficulties();
        res.json(difficulties.map((difficulty) => ({
            idDifficulty: difficulty.idDificultad,
            nivel: difficulty.nivel,
        })));
    },

    getDifficultyById: async (req: Request, res: Response) => {
        const difficulty = await recipeCatalogRepository.getDifficultyById(positiveId(req.params.id));
        if (!difficulty) return res.status(404).json({ message: 'Dificultad no encontrada.' });
        return res.json({
            idDifficulty: difficulty.idDificultad,
            nivel: difficulty.nivel,
        });
    },

    createOrigin: async (req: Request, res: Response) => {
        const origin = await recipeCatalogRepository.createOrigin(
            textField(req.body?.nombre, 'El nombre del origen', 150),
            textField(req.body?.pais, 'El país', 100),
        );
        res.status(201).json({ idOrigin: origin.idOrigen, nombre: origin.nombreOrigen, pais: origin.paisReferencia });
    },

    updateOrigin: async (req: Request, res: Response) => {
        const updated = await recipeCatalogRepository.updateOrigin(
            positiveId(req.params.id),
            textField(req.body?.nombre, 'El nombre del origen', 150),
            textField(req.body?.pais, 'El país', 100),
        );
        if (!updated.count) return res.status(404).json({ message: 'Origen no encontrado.' });
        return res.status(204).send();
    },

    deleteOrigin: async (req: Request, res: Response) => {
        const deleted = await recipeCatalogRepository.deleteOrigin(positiveId(req.params.id));
        if (!deleted.count) return res.status(404).json({ message: 'Origen no encontrado.' });
        return res.status(204).send();
    },

    createDifficulty: async (req: Request, res: Response) => {
        const difficulty = await recipeCatalogRepository.createDifficulty(textField(req.body?.nivel, 'El nivel', 50));
        res.status(201).json({ idDifficulty: difficulty.idDificultad, nivel: difficulty.nivel });
    },

    updateDifficulty: async (req: Request, res: Response) => {
        const updated = await recipeCatalogRepository.updateDifficulty(
            positiveId(req.params.id),
            textField(req.body?.nivel, 'El nivel', 50),
        );
        if (!updated.count) return res.status(404).json({ message: 'Dificultad no encontrada.' });
        return res.status(204).send();
    },

    deleteDifficulty: async (req: Request, res: Response) => {
        const deleted = await recipeCatalogRepository.deleteDifficulty(positiveId(req.params.id));
        if (!deleted.count) return res.status(404).json({ message: 'Dificultad no encontrada.' });
        return res.status(204).send();
    },
};
