/**
 * CAPA DE NEGOCIO (Service) de Categorías.
 *
 * Acá viven las REGLAS: qué datos son válidos, qué pasa si ya existe, qué pasa si no se encuentra.
 * Usa el repository para guardar/buscar y lanza HttpError cuando algo está mal.
 *
 * Flujo de una petición:  Ruta → Controller → **Service** → Repository
 */
import { HttpError } from '../shared/errors/http-error.js';
import { parseId } from '../shared/utils/parse-id.js';
import {
    categoryRepository,
    type Category,
    type CategoryInput,
} from '../shared/repositories/category.repository.js';

const NOMBRE_MAX = 50;
const DESCRIPCION_MAX = 200;

/**
 * Valida el body que manda el cliente. Recibe `unknown` (puede venir cualquier cosa)
 * y devuelve un objeto limpio y tipado (CategoryInput), o lanza 400 si hay algún problema.
 */
function validateInput(body: unknown): CategoryInput {
    if (typeof body !== 'object' || body === null) {
        throw new HttpError(400, 'Faltan los datos de la categoría');
    }
    const { nombre, descripcion } = body as Record<string, unknown>;

    if (typeof nombre !== 'string' || nombre.trim() === '') {
        throw new HttpError(400, 'El nombre es obligatorio');
    }
    if (nombre.trim().length > NOMBRE_MAX) {
        throw new HttpError(400, `El nombre no puede superar los ${NOMBRE_MAX} caracteres`);
    }
    if (descripcion !== undefined && typeof descripcion !== 'string') {
        throw new HttpError(400, 'La descripción debe ser texto');
    }
    const descripcionLimpia = (descripcion ?? '').trim();
    if (descripcionLimpia.length > DESCRIPCION_MAX) {
        throw new HttpError(400, `La descripción no puede superar los ${DESCRIPCION_MAX} caracteres`);
    }

    // trim() saca los espacios sobrantes al principio y al final.
    return { nombre: nombre.trim(), descripcion: descripcionLimpia };
}

export const categoryService = {
    getAll: (): Category[] => categoryRepository.getAllCategories(),

    getById: (rawId: unknown): Category => {
        const category = categoryRepository.getCategoryById(parseId(rawId));
        if (!category) throw new HttpError(404, 'Categoría no encontrada');
        return category;
    },

    create: (body: unknown): Category => {
        const data = validateInput(body);
        // Regla de negocio: no puede haber dos categorías con el mismo nombre.
        if (categoryRepository.getCategoryByName(data.nombre)) {
            throw new HttpError(409, 'Ya existe una categoría con ese nombre');   // 409 = conflicto
        }
        return categoryRepository.createCategory(data);
    },

    update: (rawId: unknown, body: unknown): Category => {
        const id = parseId(rawId);
        const data = validateInput(body);

        if (!categoryRepository.getCategoryById(id)) {
            throw new HttpError(404, 'Categoría no encontrada');
        }
        // Puede conservar su propio nombre, pero no copiar el de OTRA categoría.
        const mismoNombre = categoryRepository.getCategoryByName(data.nombre);
        if (mismoNombre && mismoNombre.idCategory !== id) {
            throw new HttpError(409, 'Ya existe una categoría con ese nombre');
        }
        // Si no hay error, el update siempre encuentra la categoría; el `as Category` lo informa a TypeScript.
        return categoryRepository.updateCategory(id, data) as Category;
    },

    remove: (rawId: unknown): void => {
        const deleted = categoryRepository.deleteCategory(parseId(rawId));
        if (!deleted) throw new HttpError(404, 'Categoría no encontrada');
        // TODO (cuando existan Platos con categoría): impedir borrar categorías que estén en uso.
    },
};
