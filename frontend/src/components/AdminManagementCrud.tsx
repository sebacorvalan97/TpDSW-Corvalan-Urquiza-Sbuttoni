import { useState, useEffect, useMemo, type FormEvent } from 'react';
import {
  adminManagementService,
  type AdminAccount,
  type CreateAdminData,
  type UpdateAdminData,
} from '../services/admin-management.service';
import { getErrorMessage } from '../services/http';

interface Props {
  currentAdminId?: number;
  onAdminsChanged?: (admins: AdminAccount[]) => void;
}

interface FormState {
  name: string;
  mail: string;
  password: string;
  state: 'activo' | 'inactivo';
}

const emptyForm: FormState = {
  name: '',
  mail: '',
  password: '',
  state: 'activo',
};

export default function AdminManagementCrud({ currentAdminId, onAdminsChanged }: Props) {
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'activo' | 'inactivo'>('all');

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminAccount | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Modal de confirmación de eliminación
  const [adminToDelete, setAdminToDelete] = useState<AdminAccount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const reloadAdmins = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminManagementService.getAllAdmins();
      setAdmins(data);
      onAdminsChanged?.(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    void adminManagementService.getAllAdmins().then((data) => {
      if (!isMounted) return;
      setAdmins(data);
      onAdminsChanged?.(data);
    }).catch((err: unknown) => {
      if (isMounted) setError(getErrorMessage(err));
    }).finally(() => {
      if (isMounted) setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [onAdminsChanged]);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const filteredAdmins = useMemo(() => {
    return admins.filter((a) => {
      const query = searchTerm.toLowerCase().trim();
      const matchSearch =
        query === '' ||
        a.name.toLowerCase().includes(query) ||
        a.mail.toLowerCase().includes(query) ||
        String(a.idAdmin).includes(query);

      const isActive = a.state === 'activo' || a.state === 'active';
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'activo' && isActive) ||
        (statusFilter === 'inactivo' && !isActive);

      return matchSearch && matchStatus;
    });
  }, [admins, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const total = admins.length;
    const activos = admins.filter((a) => a.state === 'activo' || a.state === 'active').length;
    const inactivos = total - activos;
    return { total, activos, inactivos };
  }, [admins]);

  const handleOpenCreate = () => {
    setEditingAdmin(null);
    setForm(emptyForm);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (admin: AdminAccount) => {
    setEditingAdmin(admin);
    setForm({
      name: admin.name,
      mail: admin.mail,
      password: '',
      state: admin.state === 'inactivo' || admin.state === 'inactive' ? 'inactivo' : 'activo',
    });
    setModalError(null);
    setIsModalOpen(true);
  };

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
    if (!editingAdmin && (!form.password || form.password.length < 8)) {
      setModalError('La contraseña es obligatoria y debe tener al menos 8 caracteres.');
      return;
    }
    if (editingAdmin && form.password && form.password.length < 8) {
      setModalError('Si cambias la contraseña, debe contener al menos 8 caracteres.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingAdmin) {
        const updatePayload: UpdateAdminData = {
          name: form.name.trim(),
          mail: form.mail.trim(),
          state: form.state,
          ...(form.password ? { password: form.password } : {}),
        };
        const updated = await adminManagementService.updateAdmin(editingAdmin.idAdmin, updatePayload);
        setAdmins((prev) => prev.map((a) => (a.idAdmin === updated.idAdmin ? updated : a)));
        showSuccess(`Administrador "${updated.name}" actualizado correctamente.`);
      } else {
        const createPayload: CreateAdminData = {
          name: form.name.trim(),
          mail: form.mail.trim(),
          password: form.password,
          state: form.state,
        };
        const created = await adminManagementService.createAdmin(createPayload);
        setAdmins((prev) => [...prev, created]);
        showSuccess(`Administrador "${created.name}" creado con éxito.`);
      }
      setIsModalOpen(false);
    } catch (err) {
      setModalError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleState = async (admin: AdminAccount) => {
    setError(null);
    try {
      const updated = await adminManagementService.toggleAdminState(admin.idAdmin, admin.state);
      setAdmins((prev) => prev.map((a) => (a.idAdmin === updated.idAdmin ? updated : a)));
      const nextStatusLabel = updated.state === 'activo' || updated.state === 'active' ? 'activado' : 'desactivado';
      showSuccess(`Administrador "${updated.name}" ${nextStatusLabel} correctamente.`);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleConfirmDelete = async () => {
    if (!adminToDelete) return;
    setIsDeleting(true);
    setError(null);
    try {
      await adminManagementService.deleteAdmin(adminToDelete.idAdmin);
      setAdmins((prev) => prev.filter((a) => a.idAdmin !== adminToDelete.idAdmin));
      showSuccess(`Administrador "${adminToDelete.name}" eliminado correctamente.`);
      setAdminToDelete(null);
    } catch (err) {
      setError(getErrorMessage(err));
      setAdminToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section className="space-y-6 rounded-2xl border border-[#c2c9bb]/60 bg-white p-6 shadow-sm">
      {/* Cabecera */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl text-[#154212]">admin_panel_settings</span>
            <h2 className="font-serif-display text-2xl font-bold text-[#154212]">
              Gestión de Administradores
            </h2>
          </div>
          <p className="text-xs text-[#605e5b]">
            Administra las cuentas con privilegios de gestión de catálogos y moderación de la plataforma.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-[#f6f3f2] px-3 py-1.5 text-xs text-[#42493e]">
            <span><strong>{stats.total}</strong> admins</span>
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
            <span className="material-symbols-outlined text-base">shield_person</span>
            Nuevo Administrador
          </button>
        </div>
      </div>

      {/* Alertas */}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-[#e6f4ea] p-3 text-xs font-semibold text-[#137333] shadow-xs" role="status">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          <span>{successMessage}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center justify-between rounded-xl bg-[#ffdad6] p-3 text-xs font-semibold text-[#93000a] shadow-xs" role="alert">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => void reloadAdmins()}
            className="text-xs underline hover:no-underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Buscador y Filtro */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#72796e]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar administrador por nombre, correo o ID..."
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

      {/* Tabla */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 text-[#605e5b]">
          <span className="material-symbols-outlined animate-spin text-3xl text-[#154212]">
            progress_activity
          </span>
          <p className="mt-2 text-xs">Cargando administradores...</p>
        </div>
      ) : filteredAdmins.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#c2c9bb] py-12 text-center text-[#605e5b]">
          <span className="material-symbols-outlined text-4xl text-[#72796e]">shield_person</span>
          <p className="mt-2 text-sm font-semibold">No se encontraron administradores</p>
          <p className="text-xs text-[#605e5b]">
            Prueba modificando los criterios de búsqueda o filtros.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#e4e2e1]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f6f3f2] text-[#42493e] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Administrador</th>
                <th className="py-3 px-4">Correo</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4e2e1] bg-white">
              {filteredAdmins.map((admin) => {
                const isActive = admin.state === 'activo' || admin.state === 'active';
                const isCurrentSession = currentAdminId === admin.idAdmin;
                return (
                  <tr key={admin.idAdmin} className="hover:bg-[#fbf9f8] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#154212] text-sm font-bold text-white">
                          {admin.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-[#1b1c1c] truncate">{admin.name}</p>
                            {isCurrentSession && (
                              <span className="rounded-full bg-[#bcf0ae]/60 px-2 py-0.5 text-[10px] font-bold text-[#154212]">
                                Tú
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-[#72796e]">ID Admin: #{admin.idAdmin}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[#42493e]">{admin.mail}</td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => void handleToggleState(admin)}
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

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(admin)}
                          className="rounded-lg p-1.5 text-[#42493e] hover:bg-[#f6f3f2] hover:text-[#154212] transition"
                          title="Editar administrador"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button
                          type="button"
                          disabled={isCurrentSession || admins.length <= 1}
                          onClick={() => setAdminToDelete(admin)}
                          className="rounded-lg p-1.5 text-[#ba1a1a] hover:bg-red-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
                          title={
                            isCurrentSession
                              ? 'No puedes eliminar tu propia cuenta en sesión'
                              : admins.length <= 1
                                ? 'No se puede eliminar al único administrador'
                                : 'Eliminar administrador'
                          }
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
                {editingAdmin ? `Editar Administrador: ${editingAdmin.name}` : 'Nuevo Administrador'}
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
              <div className="flex items-center gap-2 rounded-xl bg-[#ffdad6] p-3 text-xs font-semibold text-[#93000a]" role="alert">
                <span className="material-symbols-outlined text-sm">error</span>
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#42493e] mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: Admin Principal"
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
                  placeholder="admin@recetario.com"
                  className="w-full rounded-xl border border-[#c2c9bb] bg-[#fbf9f8] p-2.5 text-xs text-[#1b1c1c] focus:outline-hidden focus:ring-2 focus:ring-[#154212]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#42493e] mb-1">
                    Contraseña {editingAdmin ? '(opcional)' : '* (mín. 8 caracteres)'}
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder={editingAdmin ? 'Dejar vacío para conservar' : 'Mínimo 8 caracteres'}
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
                  {editingAdmin ? 'Guardar Cambios' : 'Crear Administrador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {adminToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-[#ba1a1a]">
              <span className="material-symbols-outlined text-3xl">warning</span>
              <h3 className="font-serif-display text-lg font-bold text-[#1b1c1c]">
                ¿Eliminar Administrador?
              </h3>
            </div>
            <p className="text-xs text-[#42493e] leading-relaxed">
              ¿Estás seguro de que deseas eliminar la cuenta de administrador de{' '}
              <strong>{adminToDelete.name}</strong> (<code>{adminToDelete.mail}</code>)?
            </p>
            <div className="flex items-center justify-end gap-2 border-t border-[#e4e2e1] pt-3">
              <button
                type="button"
                onClick={() => setAdminToDelete(null)}
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
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

