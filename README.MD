## Cambios realizados

- Reorganiza el backend dentro de `backend/`
- Reorganiza el frontend dentro de `frontend/`
- Integra el CRUD legacy de usuarios
- Adapta el CRUD al endpoint `/api/users`
- Agrega soporte CORS
- Agrega tipos y componentes faltantes del frontend
- Actualiza la regla para ignorar `node_modules/`

## Validación

- `frontend`: `npm run build` exitoso
- `backend`: requiere TypeScript instalado localmente para ejecutar la compilación
