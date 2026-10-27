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

async function main() {
  console.log('=== TESTEANDO EDGE CASES Y FOREIGN KEYS ===\n');

  // Obtener admin token
  const rLogin = await req('/api/admins/login', {
    method: 'POST',
    body: JSON.stringify({ mail: 'admin@recetario.com', password: 'admin1234' }),
  });
  const token = rLogin.body?.token;

  // 1. Borrar Categoria 1 (en uso por recetas)
  const rDelCatInUse = await req('/api/categories/1', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('DELETE /api/categories/1 (en uso):', rDelCatInUse.status, rDelCatInUse.body);

  // 2. Borrar Origen 1 (en uso por platos)
  const rDelOriginInUse = await req('/api/origins/1', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('DELETE /api/origins/1 (en uso):', rDelOriginInUse.status, rDelOriginInUse.body);

  // 3. Borrar Dificultad 1 (en uso por recetas)
  const rDelDiffInUse = await req('/api/difficulties/1', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('DELETE /api/difficulties/1 (en uso):', rDelDiffInUse.status, rDelDiffInUse.body);

  // 4. Borrar Ingrediente 2 (Huevo - en uso por recetas)
  const rDelIngInUse = await req('/api/ingredients/2', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('DELETE /api/ingredients/2 (en uso):', rDelIngInUse.status, rDelIngInUse.body);

  // 5. Crear categoria con nombre excesivamente largo (> 50 chars)
  const rLongCat = await req('/api/categories', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ nombre: 'A'.repeat(51), descripcion: 'desc' }),
  });
  console.log('POST /api/categories (>50 chars):', rLongCat.status, rLongCat.body);

  // 6. Crear origen con nombre excesivamente largo (> 150 chars)
  const rLongOrigin = await req('/api/origins', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ nombre: 'B'.repeat(151), pais: 'pais' }),
  });
  console.log('POST /api/origins (>150 chars):', rLongOrigin.status, rLongOrigin.body);

  // 7. GET receta con ID no existente
  const rRecipeNotFound = await req('/api/recipes/999999');
  console.log('GET /api/recipes/999999:', rRecipeNotFound.status, rRecipeNotFound.body);

  // 8. GET receta con ID negativo
  const rRecipeNegative = await req('/api/recipes/-5');
  console.log('GET /api/recipes/-5:', rRecipeNegative.status, rRecipeNegative.body);
}

main().catch(console.error);
