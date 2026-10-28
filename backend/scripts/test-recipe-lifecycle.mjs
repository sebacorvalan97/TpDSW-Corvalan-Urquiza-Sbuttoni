const BASE_URL = 'http://localhost:8080';

async function req(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  let body = null;
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try { body = await res.json(); } catch { body = null; }
  } else {
    body = await res.text();
  }
  return { status: res.status, headers: res.headers, body };
}

async function run() {
  console.log('--- Probando ciclo de vida de Receta (Frontend Payload) ---');

  // Login como usuario normal
  const loginRes = await req('/api/users/login', {
    method: 'POST',
    body: JSON.stringify({ mail: 'martin.garcia@gmail.com', password: 'usuario1234' }),
  });
  const token = loginRes.body?.token;
  if (!token) throw new Error('No se pudo loguear el usuario');

  // Payload exacto como lo manda App.tsx tras RecipeWizardModal
  const newRecipePayload = {
    nombre: 'Guiso Criollo Especial QA',
    descripcion: 'Un guiso tradicional testeado a fondo con ingredientes autóctonos.',
    imagenUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554',
    duracion: 45,
    idCategory: 1,
    idDifficulty: 1,
    idOrigin: 1,
    ingredients: [
      { idIngredient: 2, cantidad: 2, unidad: 'unidad' },
      { idIngredient: 3, cantidad: 500, unidad: 'g' },
    ],
    steps: [
      'Picar la cebolla y saltear con los condimentos.',
      'Añadir la carne picada y cocinar 20 minutos.',
      'Servir caliente con huevos duros picados.',
    ],
  };

  const createRes = await req('/api/recipes', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(newRecipePayload),
  });

  console.log('1. Creación de receta por usuario:', createRes.status, createRes.body?.idRecipe ? `ID: ${createRes.body.idRecipe}` : createRes.body);
  if (createRes.status !== 201) throw new Error('Fallo al crear la receta');

  const recipeId = createRes.body.idRecipe;

  // Modificar la receta
  const updatePayload = {
    ...newRecipePayload,
    nombre: 'Guiso Criollo Especial QA (Editado)',
    duracion: 50,
    steps: [
      'Picar la cebolla y saltear con los condimentos.',
      'Añadir la carne picada y cocinar 25 minutos a fuego lento.',
      'Servir caliente.',
    ],
  };

  const updateRes = await req(`/api/recipes/${recipeId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(updatePayload),
  });
  console.log('2. Edición de receta por su creador:', updateRes.status, updateRes.body?.nombre);
  if (updateRes.status !== 200) throw new Error('Fallo al editar la receta');

  // Consultar la receta por ID
  const getRes = await req(`/api/recipes/${recipeId}`);
  console.log('3. Obtener receta recién creada y editada:', getRes.status, getRes.body?.nombre, `Duración: ${getRes.body?.duracion}`);

  // Borrar la receta
  const delRes = await req(`/api/recipes/${recipeId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('4. Eliminación de receta por su creador:', delRes.status);
  if (delRes.status !== 200) throw new Error('Fallo al eliminar la receta');

  console.log('--> Ciclo de vida completo verificado con ÉXITO!');
}

run().catch((e) => {
  console.error('Error en prueba de ciclo de vida:', e);
  process.exit(1);
});
