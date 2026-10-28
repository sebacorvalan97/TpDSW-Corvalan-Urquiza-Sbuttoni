import { API_BASE, JSON_HEADERS, authHeaders, request } from './http';

export interface AdminUser {
  idUser: number;
  name: string;
  birth: string;
  state: string;
  mail: string;
  bio: string;
}

export interface CreateUserData {
  name: string;
  birth: string;
  mail: string;
  password: string;
  state?: string;
  bio?: string;
}

export interface UpdateUserData {
  name?: string;
  birth?: string;
  mail?: string;
  password?: string;
  state?: string;
  bio?: string;
}

const USERS_URL = `${API_BASE}/users`;

export const userManagementService = {
  getAllUsers: (): Promise<AdminUser[]> =>
    request<AdminUser[]>(USERS_URL, {
      headers: authHeaders(),
    }),

  getUserById: (id: number): Promise<AdminUser> =>
    request<AdminUser>(`${USERS_URL}/${id}`, {
      headers: authHeaders(),
    }),

  createUser: (data: CreateUserData): Promise<AdminUser> =>
    request<{ user: AdminUser }>(USERS_URL, {
      method: 'POST',
      headers: authHeaders(JSON_HEADERS),
      body: JSON.stringify(data),
    }).then((res) => res.user),

  updateUser: (id: number, data: UpdateUserData): Promise<AdminUser> =>
    request<AdminUser>(`${USERS_URL}/${id}`, {
      method: 'PUT',
      headers: authHeaders(JSON_HEADERS),
      body: JSON.stringify(data),
    }),

  toggleUserState: (id: number, currentState: string): Promise<AdminUser> => {
    const nextState = currentState === 'activo' || currentState === 'active' ? 'inactivo' : 'activo';
    return request<AdminUser>(`${USERS_URL}/${id}`, {
      method: 'PUT',
      headers: authHeaders(JSON_HEADERS),
      body: JSON.stringify({ state: nextState }),
    });
  },

  deleteUser: (id: number): Promise<{ message: string }> =>
    request<{ message: string }>(`${USERS_URL}/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }),
};
