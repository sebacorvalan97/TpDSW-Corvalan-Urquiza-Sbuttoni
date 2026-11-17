import { API_BASE, JSON_HEADERS, authHeaders, request } from './http';

export interface AdminAccount {
  idAdmin: number;
  name: string;
  mail: string;
  state: string;
}

export interface CreateAdminData {
  name: string;
  mail: string;
  password: string;
  state?: string;
}

export interface UpdateAdminData {
  name?: string;
  mail?: string;
  password?: string;
  state?: string;
}

const ADMINS_URL = `${API_BASE}/admins`;

export const adminManagementService = {
  getAllAdmins: (): Promise<AdminAccount[]> =>
    request<AdminAccount[]>(ADMINS_URL, {
      headers: authHeaders(),
    }),

  getAdminById: (id: number): Promise<AdminAccount> =>
    request<AdminAccount>(`${ADMINS_URL}/${id}`, {
      headers: authHeaders(),
    }),

  createAdmin: (data: CreateAdminData): Promise<AdminAccount> =>
    request<AdminAccount>(ADMINS_URL, {
      method: 'POST',
      headers: authHeaders(JSON_HEADERS),
      body: JSON.stringify(data),
    }),

  updateAdmin: (id: number, data: UpdateAdminData): Promise<AdminAccount> =>
    request<AdminAccount>(`${ADMINS_URL}/${id}`, {
      method: 'PUT',
      headers: authHeaders(JSON_HEADERS),
      body: JSON.stringify(data),
    }),

  toggleAdminState: (id: number, currentState: string): Promise<AdminAccount> => {
    const nextState = currentState === 'activo' || currentState === 'active' ? 'inactivo' : 'activo';
    return request<AdminAccount>(`${ADMINS_URL}/${id}`, {
      method: 'PUT',
      headers: authHeaders(JSON_HEADERS),
      body: JSON.stringify({ state: nextState }),
    });
  },

  deleteAdmin: (id: number): Promise<{ message: string }> =>
    request<{ message: string }>(`${ADMINS_URL}/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }),
};

