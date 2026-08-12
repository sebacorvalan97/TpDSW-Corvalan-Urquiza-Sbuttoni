import React, { useEffect, useState } from 'react';
import './UserCrud.css';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

const API_URL = 'http://localhost:3000/api/usuarios';

export const UserCrud: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    rol: 'Cliente',
  });
  const [editId, setEditId] = useState<number | null>(null);

  // Cargar usuarios desde la API al montar el componente (READ)
  const cargarUsuarios = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setUsuarios(data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Crear o actualizar un usuario (CREATE / UPDATE)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.email.trim()) return;

    try {
      if (editId !== null) {
        // PUT
        await fetch(`${API_URL}/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        setEditId(null);
      } else {
        // POST
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }

      setFormData({ nombre: '', email: '', rol: 'Cliente' });
      cargarUsuarios(); // Recargar la lista desde el servidor
    } catch (error) {
      console.error('Error al guardar usuario:', error);
    }
  };

  // Cargar en el formulario
  const handleEdit = (usuario: Usuario) => {
    setEditId(usuario.id);
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    });
  };

  // Eliminar usuario (DELETE)
  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar este usuario?')) return;

    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (editId === id) handleCancel();
      cargarUsuarios();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
    }
  };

  const handleCancel = () => {
    setEditId(null);
    setFormData({ nombre: '', email: '', rol: 'Cliente' });
  };

  return (
    <div className="crud-container">
      <h2 className="crud-title">Gestión de Usuarios — El Bodegón Digital</h2>

      <form className="crud-form" onSubmit={handleSubmit}>
        <input
          className="crud-input"
          type="text"
          name="nombre"
          placeholder="Nombre completo"
          value={formData.nombre}
          onChange={handleChange}
          required
        />
        <input
          className="crud-input"
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <select
          className="crud-select"
          name="rol"
          value={formData.rol}
          onChange={handleChange}
        >
          <option value="Cliente">Cliente</option>
          <option value="Empleado">Empleado</option>
          <option value="Administrador">Administrador</option>
        </select>

        <button className="btn btn-primary" type="submit">
          {editId !== null ? 'Guardar Cambios' : 'Agregar Usuario'}
        </button>
        {editId !== null && (
          <button
            className="btn btn-secondary"
            type="button"
            onClick={handleCancel}
          >
            Cancelar
          </button>
        )}
      </form>

      <table className="crud-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>
                No hay usuarios registrados.
              </td>
            </tr>
          ) : (
            usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.nombre}</td>
                <td>{u.email}</td>
                <td>
                  <span className="badge-rol">{u.rol}</span>
                </td>
                <td>
                  <button
                    className="btn btn-edit"
                    onClick={() => handleEdit(u)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-delete"
                    onClick={() => handleDelete(u.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
export default UserCrud;
