export const isActiveAccountState = (state: string): boolean =>
    state === 'active' || state === 'activo';

export const isValidAccountState = (state: unknown): state is string =>
    state === 'activo' || state === 'inactivo' || state === 'active' || state === 'inactive';

export const normalizeAccountState = (state?: string): 'activo' | 'inactivo' =>
    state === 'inactivo' || state === 'inactive' ? 'inactivo' : 'activo';
