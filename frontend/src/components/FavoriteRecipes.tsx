import type { Categoria, Dificultad, Origen, Receta } from '../types';
import RecipeCard from './RecipeCard';

interface Props {
  recetas: Receta[];
  categorias: Categoria[];
  origenes: Origen[];
  dificultades: Dificultad[];
  onSelectRecipe: (recipe: Receta) => void;
  onToggleFavorite: (id: string) => void;
  onStartCooking: (recipe: Receta) => void;
  onExploreRecipes: () => void;
}

export default function FavoriteRecipes({
  recetas,
  categorias,
  origenes,
  dificultades,
  onSelectRecipe,
  onToggleFavorite,
  onStartCooking,
  onExploreRecipes,
}: Props) {
  const favoriteRecipes = recetas.filter((r) => r.esFavorito);

  return (
    <section className="space-y-6">
      {/* Encabezado de Recetas Favoritas */}
      <div className="rounded-2xl border border-[#c2c9bb]/60 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-3xl text-red-600 font-fill">favorite</span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#154212]">
                Mis Recetas Favoritas
              </h1>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-[#605e5b]">
              Tu colección personal de platos guardados para cocinar cuando quieras
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-xs font-semibold text-red-700">
            <span className="material-symbols-outlined text-base font-fill">favorite</span>
            <span>
              {favoriteRecipes.length} {favoriteRecipes.length === 1 ? 'Receta Guardada' : 'Recetas Guardadas'}
            </span>
          </div>
        </div>
      </div>

      {/* Grilla de Recetas Favoritas o Estado Vacío */}
      {favoriteRecipes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-[#c2c9bb] p-8 space-y-3">
          <span className="material-symbols-outlined text-4xl text-[#72796e]">
            heart_plus
          </span>
          <h2 className="font-serif-display text-lg font-bold text-[#154212]">
            Aún no tienes recetas favoritas
          </h2>
          <p className="text-xs text-[#605e5b] max-w-sm mx-auto">
            Explora el recetario y toca el ícono de corazón en los platos que más te gusten para guardarlos aquí.
          </p>
          <button
            type="button"
            onClick={onExploreRecipes}
            className="px-4 py-2 rounded-lg bg-[#154212] text-white text-xs font-bold hover:bg-[#2d5a27] transition-colors"
          >
            Descubrir Recetas
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {favoriteRecipes.map((receta) => (
            <RecipeCard
              key={receta.id}
              receta={receta}
              categorias={categorias}
              origenes={origenes}
              dificultades={dificultades}
              onSelect={onSelectRecipe}
              onToggleFavorite={onToggleFavorite}
              onStartCooking={onStartCooking}
            />
          ))}
        </div>
      )}
    </section>
  );
}

