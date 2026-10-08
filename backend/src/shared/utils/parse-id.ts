/**
 * Utilidad compartida: convierte el id que llega por la URL en número.
 *
 * ¿Por qué existe? Todos los servicios (Categoría, Ingrediente, Plato...) necesitan hacer
 * exactamente lo mismo con el id. En vez de copiar y pegar la función en cada servicio,
 * la escribimos UNA vez acá y todos la importan. Si hay que corregirla, se corrige en un solo lugar.
 */
import { HttpError } from '../errors/http-error.js';

/**
 * El id de la URL (/api/ingredients/3) siempre llega como TEXTO ("3").
 * Lo pasamos a número y verificamos que sea un entero positivo. Si no, respondemos 400.
 */
export function parseId(rawId: unknown): number {
    const id = Number(rawId);
    if (!Number.isInteger(id) || id <= 0) {
        throw new HttpError(400, 'El id debe ser un número entero positivo');
    }
    return id;
}
