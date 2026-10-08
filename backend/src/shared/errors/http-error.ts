/**
 * HttpError: un error "con código HTTP".
 *
 * ¿Para qué sirve? Cuando algo sale mal (falta un dato, no existe la categoría, etc.)
 * en vez de devolver la respuesta desde cualquier lado, hacemos `throw new HttpError(404, '...')`.
 * Ese error "viaja" hasta el middleware de errores (ver middlewares/error-handler.ts)
 * que lo transforma en una respuesta JSON prolija para el frontend.
 *
 * Ejemplo: throw new HttpError(404, 'Categoría no encontrada');
 *          → el frontend recibe status 404 y { "message": "Categoría no encontrada" }
 */
export class HttpError extends Error {
    // Código de estado HTTP: 400 (datos inválidos), 404 (no existe), 409 (conflicto), etc.
    statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);          // `message` queda guardado en la clase Error original
        this.statusCode = statusCode;
    }
}
