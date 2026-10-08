import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../shared/errors/http-error.js';

/**
 * Middleware de manejo de errores (se registra AL FINAL en app.ts).
 *
 * Express reconoce que es un "manejador de errores" porque tiene 4 parámetros
 * (err, req, res, next). Si en cualquier controlador/servicio se lanza un error,
 * Express lo manda acá. Así toda la API responde los errores con el mismo formato:
 *    { "message": "texto del error" }
 */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
    // 1) Errores que lanzamos nosotros a propósito (datos inválidos, no encontrado, etc.)
    if (err instanceof HttpError) {
        res.status(err.statusCode).json({ message: err.message });
        return;
    }

    // 2) JSON mal formado en el body (lo detecta express.json() antes de llegar a los controladores)
    if (typeof err === 'object' && err !== null && (err as { type?: string }).type === 'entity.parse.failed') {
        res.status(400).json({ message: 'El JSON enviado no es válido' });
        return;
    }

    // 3) Cualquier otro error es inesperado (un bug nuestro): lo mostramos en la consola
    //    del servidor, pero al cliente NO le damos detalles internos.
    console.error(err);
    res.status(500).json({ message: 'Error interno del servidor' });
}
