## Cambios realizados

- Reorganiza el backend dentro de `backend/`
- Reorganiza el frontend dentro de `frontend/`
- Integra el CRUD legacy de usuarios
- Adapta el CRUD al endpoint `/api/users`
- Agrega soporte CORS
- Agrega tipos y componentes faltantes del frontend
- Persiste recetas con sus platos, categorías, origen, dificultad, ingredientes y pasos
- Persiste favoritos, comentarios, reacciones, despensa y sustitutos de ingredientes
- Actualiza la regla para ignorar `node_modules/`

## Base de datos

Después de configurar `DATABASE_URL` en `backend`, aplica las migraciones pendientes con:

```sh
cd backend
npm exec prisma migrate deploy
```

La migración `20261015190000_user_recipe_features` agrega favoritos, reacciones a comentarios y notas de sustitutos. Los catálogos de orígenes y dificultades se pueden administrar desde el panel de administración.

## Validación

- `frontend`: `npm run build` exitoso
- `backend`: requiere TypeScript instalado localmente para ejecutar la compilación
