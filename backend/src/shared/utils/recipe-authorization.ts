import { HttpError } from '../errors/http-error.js';
import { recipeRepository, type Recipe } from '../repositories/recipe.repository.js';
import type { AuthenticatedPrincipal } from '../../middleware/auth.js';

/**
 * Valida que el usuario autenticado sea el creador de la receta o tenga rol de administrador.
 * Si la receta no existe, lanza 404.
 * Si el usuario no tiene permisos, lanza 403.
 * Si no hay sesión activa, lanza 401.
 */
export async function assertCanManageRecipe(
  idRecipe: number,
  session: AuthenticatedPrincipal | null
): Promise<Recipe> {
  if (!session) {
    throw new HttpError(401, 'Inicia sesión para realizar esta acción.');
  }

  const recipe = await recipeRepository.getRecipeById(idRecipe);
  if (!recipe) {
    throw new HttpError(404, 'Receta no encontrada.');
  }

  if (session.role !== 'admin' && recipe.createdByUserId !== session.id) {
    throw new HttpError(403, 'Solo puedes modificar tus propias recetas.');
  }

  return recipe;
}
