import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import './UserCrud.css';

interface ApiUser {
  idUser: number;
  name: string;
  mail: string;
  state: string;
}

interface UserFormData {
  name: string;
  mail: string;
  state: string;
}

const API_URL = 'http://localhost:8080/api/users';
const EMPTY_FORM: UserFormData = { name: '', mail: '', state: 'active' };

export default function UserCrud() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [formData, setFormData] = useState<UserFormData>(EMPTY_FORM);
  const [editId, setEditId] = useState<number | null>(null);

  const loadUsers = async () => {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('No se pudieron cargar los usuarios');
    setUsers(await response.json() as ApiUser[]);
  };

  useEffect(() => {
    loadUsers().catch((error: unknown) => console.error(error));
  }, []);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!formData.name.trim() || !formData.mail.trim()) return;

    const response = await fetch(editId === null ? API_URL : `${API_URL}/${editId}`, {
      method: editId === null ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, birth: '', password: '' }),
    });
    if (!response.ok) throw new Error('No se pudo guardar el usuario');
    setEditId(null);
    setFormData(EMPTY_FORM);
    await loadUsers();
  };

  const handleEdit = (user: ApiUser) => {
    setEditId(user.idUser);
    setFormData({ name: user.name, mail: user.mail, state: user.state });
  };

  const handleDelete = async (idUser: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar este usuario?')) return;
    const response = await fetch(`${API_URL}/${idUser}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('No se pudo eliminar el usuario');
    if (editId === idUser) {
      setEditId(null);
      setFormData(EMPTY_FORM);
    }
    await loadUsers();
  };

  const cancelEdit = () => {
    setEditId(null);
    setFormData(EMPTY_FORM);
  };

  return (
    <section className="crud-container">
      <h2 className="crud-title">Gestión de Usuarios</h2>
      <form className="crud-form" onSubmit={(event) => void handleSubmit(event)}>
        <input className="crud-input" name="name" placeholder="Nombre completo" value={formData.name} onChange={handleChange} required />
        <input className="crud-input" type="email" name="mail" placeholder="Correo electrónico" value={formData.mail} onChange={handleChange} required />
        <select className="crud-select" name="state" value={formData.state} onChange={handleChange}>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
        </select>
        <button className="btn btn-primary" type="submit">{editId === null ? 'Agregar Usuario' : 'Guardar Cambios'}</button>
        {editId !== null && <button className="btn btn-secondary" type="button" onClick={cancelEdit}>Cancelar</button>}
      </form>
      <table className="crud-table">
        <thead><tr><th>ID</th><th>Nombre</th><th>Email</th><th>Estado</th><th>Acciones</th></tr></thead>
        <tbody>
          {users.length === 0 ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>No hay usuarios registrados.</td></tr> : users.map((user) => (
            <tr key={user.idUser}>
              <td>{user.idUser}</td><td>{user.name}</td><td>{user.mail}</td><td><span className="badge-rol">{user.state}</span></td>
              <td><button className="btn btn-edit" type="button" onClick={() => handleEdit(user)}>Editar</button><button className="btn btn-delete" type="button" onClick={() => void handleDelete(user.idUser)}>Eliminar</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
