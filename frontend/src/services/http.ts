/**
 * Utilidades HTTP COMPARTIDAS por todos los servicios del frontend (categorías, ingredientes, ...).
 *
 * ¿Por qué existe? Todos los CRUD hacen lo mismo: llamar al backend con fetch y traducir los errores
 * a mensajes legibles. Lo escribimos UNA vez acá y cada servicio lo reutiliza (no copiamos y pegamos).
 */

// Dirección base del backend. Si está configurada una variable de entorno se usa, si no '/api' a través del proxy de Vite.
export const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || '/api';

// Cabecera que le avisa al backend que el cuerpo de la petición viene en formato JSON.
export const JSON_HEADERS = { 'Content-Type': 'application/json' };

export const authHeaders = (headers?: HeadersInit): Headers => {
    const result = new Headers(headers);
    const stored = sessionStorage.getItem('bodegon-session');
    if (stored) {
        try {
            const session = JSON.parse(stored) as { token?: unknown };
            if (typeof session.token === 'string') {
                result.set('Authorization', `Bearer ${session.token}`);
            }
        } catch (error: unknown) {
            console.error('No se pudo leer la sesión para autenticar la solicitud.', error);
        }
    }
    return result;
};

/**
 * Función genérica que hace la petición y traduce los errores a mensajes legibles.
 * `<T>` es un "tipo genérico": indica qué forma tiene el dato que esperamos recibir.
 */
export async function request<T>(url: string, options?: RequestInit): Promise<T> {
    let response: Response;
    try {
        response = await fetch(url, {
            ...options,
            headers: authHeaders(options?.headers),
        });
    } catch {
        // fetch falla (no responde) cuando el backend está apagado o hay problemas de red.
        throw new Error('No se pudo conectar con el servidor. Verificá que el backend esté encendido.');
    }

    if (!response.ok) {
        // El backend manda { message: '...' } cuando hay un error. Lo mostramos tal cual.
        const body = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(body?.message ?? `Error inesperado (${response.status})`);
    }

    // 204 = "salió bien pero no hay contenido" (lo que devuelve DELETE).
    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
}

// Extrae un texto legible de cualquier error (los de `request` ya traen un mensaje amigable).
export const getErrorMessage = (error: unknown): string =>
    error instanceof Error ? error.message : 'Ocurrió un error inesperado';
