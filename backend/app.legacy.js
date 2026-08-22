const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Simulación de base de datos en memoria
let usuarios = [
  {
    id: 1,
    nombre: 'Carlos Gómez',
    email: 'carlos@bodegon.com',
    rol: 'Administrador',
  },
  { id: 2, nombre: 'Ana Martínez', email: 'ana@gmail.com', rol: 'Cliente' },
];

// READ: Obtener todos los usuarios
app.get('/api/usuarios', (req, res) => {
  res.json(usuarios);
});

// CREATE: Crear un nuevo usuario
app.post('/api/usuarios', (req, res) => {
  const { nombre, email, rol } = req.body;
  const nuevoUsuario = {
    id: Date.now(),
    nombre,
    email,
    rol: rol || 'Cliente',
  };
  usuarios.push(nuevoUsuario);
  res.status(201).json(nuevoUsuario);
});

// UPDATE: Actualizar un usuario existente
app.put('/api/usuarios/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, email, rol } = req.body;
  const index = usuarios.findIndex((u) => u.id === parseInt(id));

  if (index !== -1) {
    usuarios[index] = { ...usuarios[index], nombre, email, rol };
    res.json(usuarios[index]);
  } else {
    res.status(404).json({ mensaje: 'Usuario no encontrado' });
  }
});

// DELETE: Eliminar un usuario
app.delete('/api/usuarios/:id', (req, res) => {
  const { id } = req.params;
  usuarios = usuarios.filter((u) => u.id !== parseInt(id));
  res.json({ mensaje: 'Usuario eliminado correctamente' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
