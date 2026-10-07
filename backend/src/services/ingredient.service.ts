/**
 * CAPA DE NEGOCIO (Service) de Ingredientes.
 *
 * Acá viven las REGLAS: qué datos son válidos, qué pasa si ya existe, qué pasa si no se encuentra.
 * Usa el repository para guardar/buscar y lanza HttpError cuando algo está mal.
 *
 * Flujo de una petición:  Ruta → Controller → **Service** → Repository
 */
import { HttpError } from '../shared/errors/http-error.js';
import { parseId } from '../shared/utils/parse-id.js';
import {
    ingredientRepository,
    type Ingredient,
    type IngredientInput,
} from '../shared/repositories/ingredient.repository.js';

const NOMBRE_MAX = 60;
const DESCRIPCION_MAX = 200;

// Unidades de medida que aceptamos. IMPORTANTE: el frontend tiene la misma lista en
// frontend/src/constants/unidades.ts (el select del formulario). Si se cambia una, se cambia la otra.
const UNIDADES_PERMITIDAS: readonly string[] = [
    'unidad', 'g', 'kg', 'ml', 'l', 'cucharada', 'cucharadita', 'taza', 'pizca',
];

/**
 * Valida el body que manda el cliente. Recibe `unknown` (puede venir cualquier cosa)
 * y devuelve un objeto limpio y tipado (IngredientInput), o lanza 400 si hay algún problema.
 */
function validateInput(body: unknown): IngredientInput {
    if (typeof body !== 'object' || body === null) {
        throw new HttpError(400, 'Faltan los datos del ingrediente');
    }
    const { nombre, descripcion, unidadMedidaDefecto } = body as Record<string, unknown>;

    // --- nombre: obligatorio, texto, largo máximo ---
    if (typeof nombre !== 'string' || nombre.trim() === '') {
        throw new HttpError(400, 'El nombre es obligatorio');
    }
    if (nombre.trim().length > NOMBRE_MAX) {
        throw new HttpError(400, `El nombre no puede superar los ${NOMBRE_MAX} caracteres`);
    }

    // --- unidad de medida: obligatoria y tiene que ser una de la lista ---
    if (typeof unidadMedidaDefecto !== 'string' || !UNIDADES_PERMITIDAS.includes(unidadMedidaDefecto)) {
        throw new HttpError(400, `La unidad de medida debe ser una de: ${UNIDADES_PERMITIDAS.join(', ')}`);
    }

    // --- descripción: opcional, pero si viene tiene que ser texto y no muy larga ---
    if (descripcion !== undefined && typeof descripcion !== 'string') {
        throw new HttpError(400, 'La descripción debe ser texto');
    }
    const descripcionLimpia = (descripcion ?? '').trim();
    if (descripcionLimpia.length > DESCRIPCION_MAX) {
        throw new HttpError(400, `La descripción no puede superar los ${DESCRIPCION_MAX} caracteres`);
    }

    // trim() saca los espacios sobrantes al principio y al final.
    return { nombre: nombre.trim(), descripcion: descripcionLimpia, unidadMedidaDefecto };
}

export const ingredientService = {
    getAll: (): Ingredient[] => ingredientRepository.getAllIngredients(),

    getById: (rawId: unknown): Ingredient => {
        const ingredient = ingredientRepository.getIngredientById(parseId(rawId));
        if (!ingredient) throw new HttpError(404, 'Ingrediente no encontrado');
        return ingredient;
    },

    create: (body: unknown): Ingredient => {
        const data = validateInput(body);
        // Regla de negocio: no puede haber dos ingredientes con el mismo nombre.
        if (ingredientRepository.getIngredientByName(data.nombre)) {
            throw new HttpError(409, 'Ya existe un ingrediente con ese nombre');   // 409 = conflicto
        }
        return ingredientRepository.createIngredient(data);
    },

    update: (rawId: unknown, body: unknown): Ingredient => {
        const id = parseId(rawId);
        const data = validateInput(body);

        if (!ingredientRepository.getIngredientById(id)) {
            throw new HttpError(404, 'Ingrediente no encontrado');
        }
        // Puede conservar su propio nombre, pero no copiar el de OTRO ingrediente.
        const mismoNombre = ingredientRepository.getIngredientByName(data.nombre);
        if (mismoNombre && mismoNombre.idIngredient !== id) {
            throw new HttpError(409, 'Ya existe un ingrediente con ese nombre');
        }
        // Si no hubo error, el update siempre encuentra el ingrediente; el `as Ingredient` se lo informa a TypeScript.
        return ingredientRepository.updateIngredient(id, data) as Ingredient;
    },

    remove: (rawId: unknown): void => {
        const deleted = ingredientRepository.deleteIngredient(parseId(rawId));
        if (!deleted) throw new HttpError(404, 'Ingrediente no encontrado');
        // TODO (cuando existan Recetas con ingredientes): impedir borrar ingredientes que estén en uso.
    },
};
