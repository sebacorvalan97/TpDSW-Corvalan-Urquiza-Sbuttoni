/**
 * CAPA DE NEGOCIO (Service) de Ingredientes Sustitutos.
 *
 * Acá viven las REGLAS: qué datos son válidos, qué pasa si ya existe, qué pasa si no se encuentra.
 * Usa los repositorios para guardar/buscar y lanza HttpError cuando algo está mal.
 *
 * Flujo de una petición:  Ruta → Controller → **Service** → Repository
 */
import { HttpError } from '../shared/errors/http-error.js';
import { parseId } from '../shared/utils/parse-id.js';
import { ingredientRepository } from '../shared/repositories/ingredient.repository.js';
import {
    substituteIngredientRepository,
    type SubstituteIngredient,
    type SubstituteIngredientInput,
} from '../shared/repositories/substitute-ingredient.repository.js';

const NOMBRE_SUSTITUTO_MAX = 60;
const PROPORCION_MAX = 100;
const NOTAS_MAX = 300;

/**
 * Valida el body que manda el cliente junto con el ingredientePrincipalId (ya parseado).
 * Recibe `unknown` para el body y devuelve un objeto limpio y tipado (SubstituteIngredientInput),
 * o lanza 400 si hay algún problema de validación.
 */
function validateInput(body: unknown, ingredientePrincipalId: number): SubstituteIngredientInput {
    // Validar ingredientePrincipalId: debe ser un entero positivo
    if (!Number.isInteger(ingredientePrincipalId) || ingredientePrincipalId <= 0) {
        throw new HttpError(400, 'El id del ingrediente principal debe ser un número entero positivo');
    }

    if (typeof body !== 'object' || body === null) {
        throw new HttpError(400, 'Faltan los datos del ingrediente sustituto');
    }

    const { nombreSustituto, proporcion, notas } = body as Record<string, unknown>;

    // Si viene ingredientePrincipalId en el body, verificar que coincida con el de la URL
    const bodyRecord = body as Record<string, unknown>;
    if ('ingredientePrincipalId' in bodyRecord && bodyRecord.ingredientePrincipalId !== undefined) {
        const bodyIngId = Number(bodyRecord.ingredientePrincipalId);
        if (bodyIngId !== ingredientePrincipalId) {
            throw new HttpError(400, 'El id del ingrediente principal no coincide con la URL');
        }
    }

    // --- nombreSustituto: obligatorio, texto, largo máximo ---
    if (typeof nombreSustituto !== 'string' || nombreSustituto.trim() === '') {
        throw new HttpError(400, 'El nombre del sustituto es obligatorio');
    }
    if (nombreSustituto.trim().length > NOMBRE_SUSTITUTO_MAX) {
        throw new HttpError(400, `El nombre del sustituto no puede superar los ${NOMBRE_SUSTITUTO_MAX} caracteres`);
    }

    // --- proporcion: obligatoria, texto, largo máximo ---
    if (typeof proporcion !== 'string' || proporcion.trim() === '') {
        throw new HttpError(400, 'La proporción es obligatoria');
    }
    if (proporcion.trim().length > PROPORCION_MAX) {
        throw new HttpError(400, `La proporción no puede superar los ${PROPORCION_MAX} caracteres`);
    }

    // --- notas: opcional, pero si viene tiene que ser texto y no muy larga ---
    if (notas !== undefined && typeof notas !== 'string') {
        throw new HttpError(400, 'Las notas deben ser texto');
    }
    const notasLimpias = (notas ?? '').trim();
    if (notasLimpias.length > NOTAS_MAX) {
        throw new HttpError(400, `Las notas no pueden superar los ${NOTAS_MAX} caracteres`);
    }

    return {
        ingredientePrincipalId,
        nombreSustituto: nombreSustituto.trim(),
        proporcion: proporcion.trim(),
        notas: notasLimpias,
    };
}

/**
 * Valida que el id del ingrediente principal sea válido y que el ingrediente exista en la base de datos.
 */
async function ensureIngredientExists(rawIngredientId: unknown): Promise<number> {
    const ingredientId = parseId(rawIngredientId);
    const ingredient = await ingredientRepository.getIngredientById(ingredientId);
    if (!ingredient) {
        throw new HttpError(404, 'Ingrediente principal no encontrado');
    }
    return ingredientId;
}

export const substituteIngredientService = {
    getAll: async (rawIngredientId: unknown): Promise<SubstituteIngredient[]> => {
        const ingredientId = await ensureIngredientExists(rawIngredientId);
        return substituteIngredientRepository.getAllByIngredientId(ingredientId);
    },

    getById: async (rawIngredientId: unknown, rawId: unknown): Promise<SubstituteIngredient> => {
        const ingredientId = await ensureIngredientExists(rawIngredientId);
        const id = parseId(rawId);
        const substitute = await substituteIngredientRepository.getSubstituteById(id, ingredientId);
        if (!substitute || substitute.ingredientePrincipalId !== ingredientId) {
            throw new HttpError(404, 'Ingrediente sustituto no encontrado');
        }
        return substitute;
    },

    create: async (rawIngredientId: unknown, body: unknown): Promise<SubstituteIngredient> => {
        const ingredientId = await ensureIngredientExists(rawIngredientId);
        const data = validateInput(body, ingredientId);

        // Regla de negocio: no puede haber dos sustitutos con el mismo nombre para el mismo ingrediente principal.
        const existente = await substituteIngredientRepository.getSubstituteByNameAndIngredientId(ingredientId, data.nombreSustituto);
        if (existente) {
            throw new HttpError(409, 'Ya existe un sustituto con ese nombre para este ingrediente');
        }
        return substituteIngredientRepository.createSubstitute(data);
    },

    update: async (rawIngredientId: unknown, rawId: unknown, body: unknown): Promise<SubstituteIngredient> => {
        const ingredientId = await ensureIngredientExists(rawIngredientId);
        const id = parseId(rawId);

        const existing = await substituteIngredientRepository.getSubstituteById(id, ingredientId);
        if (!existing || existing.ingredientePrincipalId !== ingredientId) {
            throw new HttpError(404, 'Ingrediente sustituto no encontrado');
        }

        const data = validateInput(body, ingredientId);

        // Puede conservar su propio nombre, pero no copiar el de OTRO sustituto del mismo ingrediente principal.
        const mismoNombre = await substituteIngredientRepository.getSubstituteByNameAndIngredientId(ingredientId, data.nombreSustituto);
        if (mismoNombre && mismoNombre.idSubstituteIngredient !== id) {
            throw new HttpError(409, 'Ya existe un sustituto con ese nombre para este ingrediente');
        }

        const updated = await substituteIngredientRepository.updateSubstitute(id, data);
        if (!updated) {
            throw new HttpError(404, 'Ingrediente sustituto no encontrado');
        }
        return updated;
    },

    remove: async (rawIngredientId: unknown, rawId: unknown): Promise<void> => {
        const ingredientId = await ensureIngredientExists(rawIngredientId);
        const id = parseId(rawId);

        const existing = await substituteIngredientRepository.getSubstituteById(id, ingredientId);
        if (!existing || existing.ingredientePrincipalId !== ingredientId) {
            throw new HttpError(404, 'Ingrediente sustituto no encontrado');
        }

        const deleted = await substituteIngredientRepository.deleteSubstitute(id, ingredientId);
        if (!deleted) {
            throw new HttpError(404, 'Ingrediente sustituto no encontrado');
        }
    },
};
