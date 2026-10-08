/**
 * Unidades de medida disponibles para los ingredientes.
 *
 * IMPORTANTE: el backend valida contra la misma lista (backend/src/services/ingredient.service.ts,
 * constante UNIDADES_PERMITIDAS). Si agregás o cambiás una unidad, hay que cambiarla en los dos lados.
 *
 *   value → lo que se guarda y se envía al backend
 *   label → lo que ve la persona en pantalla
 */
export const UNIDADES_MEDIDA = [
    { value: 'unidad', label: 'Unidad' },
    { value: 'g', label: 'Gramos (g)' },
    { value: 'kg', label: 'Kilogramos (kg)' },
    { value: 'ml', label: 'Mililitros (ml)' },
    { value: 'l', label: 'Litros (l)' },
    { value: 'cucharada', label: 'Cucharada' },
    { value: 'cucharadita', label: 'Cucharadita' },
    { value: 'taza', label: 'Taza' },
    { value: 'pizca', label: 'Pizca' },
] as const;

// Devuelve el nombre legible de una unidad ('g' → 'Gramos (g)'). Si no la conoce, muestra el valor tal cual.
export const getUnidadLabel = (value: string): string =>
    UNIDADES_MEDIDA.find((u) => u.value === value)?.label ?? value;
