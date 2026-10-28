import type { Request, Response } from 'express';
import { pasoRecetaRepository } from '../shared/repositories/paso-receta.repository.js';
import { parseId } from '../shared/utils/parse-id.js';
import { HttpError } from '../shared/errors/http-error.js';
import { getSessionFromRequest } from '../middleware/auth.js';
import { assertCanManageRecipe } from '../shared/utils/recipe-authorization.js';

export const pasoRecetaController = {
  getAllPasos: async (_req: Request, res: Response) => {
    const pasos = await pasoRecetaRepository.getAllPasos();
    res.json(pasos);
  },

  createPaso: async (req: Request, res: Response) => {
    const session = getSessionFromRequest(req);
    const { recetaId, numeroOrden, descripcion } = req.body ?? {};

    const idReceta = parseId(recetaId);
    if (!Number.isInteger(numeroOrden) || numeroOrden <= 0) {
      throw new HttpError(400, 'El número de orden debe ser un entero positivo.');
    }
    if (typeof descripcion !== 'string' || !descripcion.trim()) {
      throw new HttpError(400, 'La descripción del paso es obligatoria.');
    }

    await assertCanManageRecipe(idReceta, session);

    const newPaso = await pasoRecetaRepository.createPaso(
      idReceta,
      numeroOrden,
      descripcion.trim(),
    );
    res.status(201).json(newPaso);
  },

  updatePaso: async (req: Request, res: Response) => {
    const idPaso = parseId(req.params.id);
    const session = getSessionFromRequest(req);

    const existingPaso = await pasoRecetaRepository.getPasoById(idPaso);
    if (!existingPaso) {
      throw new HttpError(404, 'Paso no encontrado.');
    }

    await assertCanManageRecipe(existingPaso.recetaId, session);

    const { recetaId, numeroOrden, descripcion } = req.body ?? {};
    if (recetaId !== undefined && recetaId !== existingPaso.recetaId) {
      throw new HttpError(400, 'No se permite transferir un paso a otra receta.');
    }
    if (numeroOrden !== undefined && (!Number.isInteger(numeroOrden) || numeroOrden <= 0)) {
      throw new HttpError(400, 'El número de orden debe ser un entero positivo.');
    }
    if (descripcion !== undefined && (typeof descripcion !== 'string' || !descripcion.trim())) {
      throw new HttpError(400, 'La descripción del paso no puede estar vacía.');
    }

    const updatedPaso = await pasoRecetaRepository.updatePaso(idPaso, {
      ...(numeroOrden !== undefined ? { numeroOrden } : {}),
      ...(descripcion !== undefined ? { descripcion: descripcion.trim() } : {}),
    });

    res.json(updatedPaso);
  },

  deletePaso: async (req: Request, res: Response) => {
    const idPaso = parseId(req.params.id);
    const session = getSessionFromRequest(req);

    const existingPaso = await pasoRecetaRepository.getPasoById(idPaso);
    if (!existingPaso) {
      throw new HttpError(404, 'Paso no encontrado.');
    }

    await assertCanManageRecipe(existingPaso.recetaId, session);

    await pasoRecetaRepository.deletePaso(idPaso);
    res.json({ message: 'Paso eliminado correctamente.' });
  },

  getPasoById: async (req: Request, res: Response) => {
    const idPaso = parseId(req.params.id);
    const paso = await pasoRecetaRepository.getPasoById(idPaso);

    if (!paso) {
      throw new HttpError(404, 'Paso no encontrado.');
    }
    res.json(paso);
  },
};
