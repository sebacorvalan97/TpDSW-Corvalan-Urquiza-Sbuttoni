import { useState, useEffect, ChangeEvent, FormEvent } from 'react';

export interface User {
  id?: string | number;
  name: string;
  email: string;
}

const API_URL = 'http://localhost:3000/api/users';

export default function UserCrud() {
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<User>({ name: '', email: '' });
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    try {
      if (editingId) {
        await fetch(`${API_URL}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        setEditingId(null);
      } else {
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }
      setFormData({ name: '', email: '' });
      fetchUsers();
    } catch (error) {
      console.error('Error al guardar el usuario:', error);
    }
  };

  const handleEdit = (user: User) => {
    if (user.id !== undefined) {
      setEditingId(user.id);
      setFormData({ name: user.name, email: user.email });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', email: '' });
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm('¿Seguro que deseas eliminar este usuario?')) return;
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchUsers();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
    }
  };

  return (
    <div
      style={{
        maxWidth: '600px',
        margin: '20px auto',
        fontFamily: 'sans-serif',
      }}
    >
      <h2>Gestión de Usuarios - El Bodegón Digital</h2>

      <form
        onSubmit={handleSubmit}
        style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}
      >
        <input
          type="text"
          name="name"
          placeholder="Nombre"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <button type="submit">{editingId ? 'Actualizar' : 'Agregar'}</button>
        {editingId && (
          <button type="button" onClick={handleCancelEdit}>
            Cancelar
          </button>
        )}
      </form>

      {loading ? (
        <p>Cargando usuarios...</p>
      ) : (
        <table
          border={1}
          cellPadding={8}
          style={{ width: '100%', borderCollapse: 'collapse' }}
        >
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center' }}>
                  No hay usuarios registrados.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <button onClick={() => handleEdit(user)}>Editar</button>{' '}
                    <button
                      onClick={() =>
                        user.id !== undefined && handleDelete(user.id)
                      }
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
