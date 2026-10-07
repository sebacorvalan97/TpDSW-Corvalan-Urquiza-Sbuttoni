/**
 * Utilidades HTTP COMPARTIDAS por todos los servicios del frontend (categorías, ingredientes, ...).
 *
 * ¿Por qué existe? Todos los CRUD hacen lo mismo: llamar al backend con fetch y traducir los errores
 * a mensajes legibles. Lo escribimos UNA vez acá y cada servicio lo reutiliza (no copiamos y pegamos).
 */

// Dirección base del backend. Cada servicio le suma su recurso: `${API_BASE}/ingredients`.
export const API_BASE = 'http://localhost:8080/api';

// Cabecera que le avisa al backend que el cuerpo de la petición viene en formato JSON.
export const JSON_HEADERS = { 'Content-Type': 'application/json' };

/**
 * Función genérica que hace la petición y traduce los errores a mensajes legibles.
 * `<T>` es un "tipo genérico": indica qué forma tiene el dato que esperamos recibir.
 */
export async function request<T>(url: string, options?: RequestInit): Promise<T> {
    let response: Response;
    try {
        response = await fetch(url, options);
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
