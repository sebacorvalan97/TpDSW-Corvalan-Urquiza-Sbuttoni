import { useState, useEffect, useMemo, type FormEvent } from 'react';
import {
  userManagementService,
  type AdminUser,
  type CreateUserData,
  type UpdateUserData,
} from '../services/user-management.service';
import { getErrorMessage } from '../services/http';

interface Props {
  onUsersChanged?: (users: AdminUser[]) => void;
}

interface FormState {
  name: string;
  mail: string;
  birth: string;
  password: string;
  state: 'activo' | 'inactivo';
  bio: string;
}

const emptyForm: FormState = {
  name: '',
  mail: '',
  birth: '',
  password: '',
  state: 'activo',
  bio: '',
};

export default function UserManagementCrud({ onUsersChanged }: Props) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'activo' | 'inactivo'>('all');

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Modal de confirmación de eliminación
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Cargar usuarios al montar
  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await userManagementService.getAllUsers();
      setUsers(data);
      onUsersChanged?.(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  // Notificación temporal
  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Filtrado reactivo
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const query = searchTerm.toLowerCase().trim();
      const matchSearch =
        query === '' ||
        u.name.toLowerCase().includes(query) ||
        u.mail.toLowerCase().includes(query) ||
        String(u.idUser).includes(query);

      const isActive = u.state === 'activo' || u.state === 'active';
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'activo' && isActive) ||
        (statusFilter === 'inactivo' && !isActive);

      return matchSearch && matchStatus;
    });
  }, [users, searchTerm, statusFilter]);

  // Contadores
  const stats = useMemo(() => {
    const total = users.length;
    const activos = users.filter((u) => u.state === 'activo' || u.state === 'active').length;
    const inactivos = total - activos;
    return { total, activos, inactivos };
  }, [users]);

  // Abrir modal de creación
  const handleOpenCreate = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setModalError(null);
    setIsModalOpen(true);
  };

  // Abrir modal de edición
  const handleOpenEdit = (user: AdminUser) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      mail: user.mail,
      birth: user.birth || '',
      password: '',
      state: user.state === 'inactivo' ? 'inactivo' : 'activo',
      bio: user.bio || '',
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  // Guardar (Crear o Actualizar)
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!form.name.trim()) {
      setModalError('El nombre es obligatorio.');
      return;
    }
    if (!form.mail.trim()) {
      setModalError('El correo electrónico es obligatorio.');
      return;
    }
    if (!editingUser && (!form.password || form.password.length < 8)) {
      setModalError('La contraseña es obligatoria y debe tener al menos 8 caracteres.');
      return;
    }
    if (editingUser && form.password && form.password.length < 8) {
      setModalError('Si cambias la contraseña, debe contener al menos 8 caracteres.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingUser) {
        const updatePayload: UpdateUserData = {
          name: form.name.trim(),
          mail: form.mail.trim(),
          birth: form.birth,
          state: form.state,
          bio: form.bio.trim(),
          ...(form.password ? { password: form.password } : {}),
        };
        const updated = await userManagementService.updateUser(editingUser.idUser, updatePayload);
        setUsers((prev) => prev.map((u) => (u.idUser === updated.idUser ? updated : u)));
        showSuccess(`Usuario "${updated.name}" actualizado correctamente.`);
      } else {
        const createPayload: CreateUserData = {
          name: form.name.trim(),
          mail: form.mail.trim(),
          birth: form.birth,
          password: form.password,
          state: form.state,
          bio: form.bio.trim(),
        };
        const created = await userManagementService.createUser(createPayload);
        setUsers((prev) => [...prev, created]);
        showSuccess(`Usuario "${created.name}" creado con éxito.`);
      }
      setIsModalOpen(false);
    } catch (err) {
      setModalError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  // Alternar estado activo / inactivo
  const handleToggleState = async (user: AdminUser) => {
    try {
      const updated = await userManagementService.toggleUserState(user.idUser, user.state);
      setUsers((prev) => prev.map((u) => (u.idUser === updated.idUser ? updated : u)));
      const nextStatusLabel = updated.state === 'activo' || updated.state === 'active' ? 'activado' : 'desactivado';
      showSuccess(`Usuario "${updated.name}" ${nextStatusLabel} correctamente.`);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // Confirmar y eliminar usuario
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await userManagementService.deleteUser(userToDelete.idUser);
      setUsers((prev) => prev.filter((u) => u.idUser !== userToDelete.idUser));
      showSuccess(`Usuario "${userToDelete.name}" eliminado de la base de datos.`);
      setUserToDelete(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section className="space-y-6 rounded-2xl border border-[#c2c9bb]/60 bg-white p-6 shadow-sm">
      {/* Cabecera del panel de usuarios */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl text-[#154212]">manage_accounts</span>
            <h2 className="font-serif-display text-2xl font-bold text-[#154212]">
              Gestión de Usuarios
            </h2>
          </div>
          <p className="text-xs text-[#605e5b]">
            Administra las cuentas de cocineros, permisos de acceso y estados en El Bodegón Digital.
          </p>
        </div>

        {/* Métricas y Botón Nuevo */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-[#f6f3f2] px-3 py-1.5 text-xs text-[#42493e]">
            <span><strong>{stats.total}</strong> usuarios</span>
            <span>·</span>
            <span className="text-[#154212] font-semibold">{stats.activos} activos</span>
            {stats.inactivos > 0 && (
              <>
                <span>·</span>
                <span className="text-[#ba1a1a] font-semibold">{stats.inactivos} inactivos</span>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#154212] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#2d5a27] active:scale-98"
          >
            <span className="material-symbols-outlined text-base">person_add</span>
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Alertas globales */}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-[#e6f4ea] p-3 text-xs font-semibold text-[#137333] shadow-xs">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          <span>{successMessage}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center justify-between rounded-xl bg-[#ffdad6] p-3 text-xs font-semibold text-[#93000a] shadow-xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => void loadUsers()}
            className="text-xs underline hover:no-underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Barra de Búsqueda y Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#72796e]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, correo o ID..."
            className="w-full rounded-xl border border-[#c2c9bb] bg-[#fbf9f8] py-2 pl-9 pr-3 text-xs text-[#1b1c1c] focus:outline-hidden focus:ring-2 focus:ring-[#154212]"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-[#42493e]">Estado:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'activo' | 'inactivo')}
            className="rounded-xl border border-[#c2c9bb] bg-[#fbf9f8] px-3 py-2 text-xs font-semibold text-[#42493e] focus:outline-hidden"
          >
            <option value="all">Todos ({stats.total})</option>
            <option value="activo">Solo Activos ({stats.activos})</option>
            <option value="inactivo">Solo Inactivos ({stats.inactivos})</option>
          </select>
        </div>
      </div>

      {/* Tabla de Usuarios */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 text-[#605e5b]">
          <span className="material-symbols-outlined animate-spin text-3xl text-[#154212]">
            progress_activity
          </span>
          <p className="mt-2 text-xs">Cargando usuarios registrados...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#c2c9bb] py-12 text-center text-[#605e5b]">
          <span className="material-symbols-outlined text-4xl text-[#72796e]">group_off</span>
          <p className="mt-2 text-sm font-semibold">No se encontraron usuarios</p>
          <p className="text-xs text-[#605e5b]">
            {searchTerm || statusFilter !== 'all'
              ? 'Prueba modificando los criterios de búsqueda o filtros.'
              : 'Todavía no hay usuarios registrados en el sistema.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#e4e2e1]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f6f3f2] text-[#42493e] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-4">Correo</th>
                <th className="py-3 px-4">Nacimiento</th>
                <th className="py-3 px-4">Biografía</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4e2e1] bg-white">
              {filteredUsers.map((user) => {
                const isActive = user.state === 'activo' || user.state === 'active';
                return (
                  <tr key={user.idUser} className="hover:bg-[#fbf9f8] transition-colors">
                    {/* Usuario / Avatar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#154212]/10 text-sm font-bold text-[#154212]">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#1b1c1c] truncate">{user.name}</p>
                          <p className="text-[10px] text-[#72796e]">ID: #{user.idUser}</p>
                        </div>
                      </div>
                    </td>

                    {/* Correo */}
                    <td className="py-3.5 px-4 font-mono text-[#42493e]">{user.mail}</td>

                    {/* Nacimiento */}
                    <td className="py-3.5 px-4 text-[#42493e]">
                      {user.birth ? user.birth : <span className="text-[#a8aaa2] italic">Sin fecha</span>}
                    </td>

                    {/* Biografía */}
                    <td className="py-3.5 px-4 text-[#605e5b] max-w-xs truncate" title={user.bio}>
                      {user.bio ? user.bio : <span className="text-[#a8aaa2] italic">Sin biografía</span>}
                    </td>

                    {/* Estado con toggle rápido */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => void handleToggleState(user)}
                        title={`Haz clic para cambiar a ${isActive ? 'inactivo' : 'activo'}`}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition hover:opacity-80 active:scale-95 ${
                          isActive
                            ? 'bg-[#e6f4ea] text-[#137333]'
                            : 'bg-[#fce8e6] text-[#c5221f]'
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            isActive ? 'bg-[#137333]' : 'bg-[#c5221f]'
                          }`}
                        />
                        {isActive ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(user)}
                          className="rounded-lg p-1.5 text-[#42493e] hover:bg-[#f6f3f2] hover:text-[#154212] transition"
                          title="Editar usuario"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserToDelete(user)}
                          className="rounded-lg p-1.5 text-[#ba1a1a] hover:bg-red-50 transition"
                          title="Eliminar usuario"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Creación / Edición */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#e4e2e1] pb-3">
              <h3 className="font-serif-display text-lg font-bold text-[#154212]">
                {editingUser ? `Editar Usuario: ${editingUser.name}` : 'Crear Nuevo Usuario'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#72796e] hover:text-[#1b1c1c]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {modalError && (
              <div className="flex items-center gap-2 rounded-xl bg-[#ffdad6] p-3 text-xs font-semibold text-[#93000a]">
                <span className="material-symbols-outlined text-sm">error</span>
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#42493e] mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: Sofía Rodriguez"
                  className="w-full rounded-xl border border-[#c2c9bb] bg-[#fbf9f8] p-2.5 text-xs text-[#1b1c1c] focus:outline-hidden focus:ring-2 focus:ring-[#154212]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#42493e] mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={form.mail}
                  onChange={(e) => setForm({ ...form, mail: e.target.value })}
                  placeholder="ejemplo@bodegon.com"
                  className="w-full rounded-xl border border-[#c2c9bb] bg-[#fbf9f8] p-2.5 text-xs text-[#1b1c1c] focus:outline-hidden focus:ring-2 focus:ring-[#154212]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#42493e] mb-1">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    value={form.birth}
                    onChange={(e) => setForm({ ...form, birth: e.target.value })}
                    className="w-full rounded-xl border border-[#c2c9bb] bg-[#fbf9f8] p-2.5 text-xs text-[#1b1c1c] focus:outline-hidden focus:ring-2 focus:ring-[#154212]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#42493e] mb-1">Estado de la Cuenta</label>
                  <select
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value as 'activo' | 'inactivo' })}
                    className="w-full rounded-xl border border-[#c2c9bb] bg-[#fbf9f8] p-2.5 text-xs font-semibold text-[#1b1c1c] focus:outline-hidden focus:ring-2 focus:ring-[#154212]"
                  >
                    <option value="activo">Activo (habilitado)</option>
                    <option value="inactivo">Inactivo (deshabilitado)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#42493e] mb-1">
                  Contraseña {editingUser ? '(opcional)' : '* (mínimo 8 caracteres)'}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={editingUser ? 'Dejar en blanco para conservar la actual' : 'Mínimo 8 caracteres'}
                  className="w-full rounded-xl border border-[#c2c9bb] bg-[#fbf9f8] p-2.5 text-xs text-[#1b1c1c] focus:outline-hidden focus:ring-2 focus:ring-[#154212]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#42493e] mb-1">Biografía Culinaria</label>
                <textarea
                  rows={3}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Descripción, especialidades o trayectoria del usuario..."
                  className="w-full rounded-xl border border-[#c2c9bb] bg-[#fbf9f8] p-2.5 text-xs text-[#1b1c1c] focus:outline-hidden focus:ring-2 focus:ring-[#154212]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[#e4e2e1] pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-[#c2c9bb] px-4 py-2 text-xs font-semibold text-[#42493e] hover:bg-[#f6f3f2]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#154212] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#2d5a27] disabled:opacity-50"
                >
                  {isSaving && (
                    <span className="material-symbols-outlined animate-spin text-sm">
                      progress_activity
                    </span>
                  )}
                  {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-[#ba1a1a]">
              <span className="material-symbols-outlined text-3xl">warning</span>
              <h3 className="font-serif-display text-lg font-bold text-[#1b1c1c]">
                ¿Eliminar Usuario?
              </h3>
            </div>
            <p className="text-xs text-[#42493e] leading-relaxed">
              ¿Estás seguro de que deseas eliminar permanentemente la cuenta de{' '}
              <strong>{userToDelete.name}</strong> (<code>{userToDelete.mail}</code>)?
            </p>
            <div className="rounded-xl bg-[#fff8f6] border border-[#ffdad6] p-3 text-xs text-[#93000a]">
              Esta acción no se puede deshacer. Si solo deseas restringir su acceso, te recomendamos
              cambiar su estado a <strong>Inactivo</strong>.
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-[#e4e2e1] pt-3">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="rounded-xl border border-[#c2c9bb] px-4 py-2 text-xs font-semibold text-[#42493e] hover:bg-[#f6f3f2]"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => void handleConfirmDelete()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#ba1a1a] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#93000a] disabled:opacity-50"
              >
                {isDeleting && (
                  <span className="material-symbols-outlined animate-spin text-sm">
                    progress_activity
                  </span>
                )}
                Sí, Eliminar Permanentemente
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
