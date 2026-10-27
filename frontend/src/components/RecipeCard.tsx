import type { Categoria, Dificultad, Origen, Receta } from '../types';

interface Props {
  receta: Receta;
  categorias?: Categoria[];
  origenes?: Origen[];
  dificultades?: Dificultad[];
  onSelect: (recipe: Receta) => void;
  onToggleFavorite?: (id: string) => void;
  onStartCooking?: (recipe: Receta) => void;
}

export default function RecipeCard({
  receta,
  categorias = [],
  origenes = [],
  dificultades = [],
  onSelect,
}: Props) {
  const categoryName = categorias.find((cat) => cat.id === receta.plato.categoriaId)?.nombre;
  const originName = origenes.find((orig) => orig.id === receta.plato.origenId)?.pais;
  const difficultyName = dificultades.find((diff) => diff.id === receta.plato.dificultadId)?.nivel;
  const totalMinutes = (receta.tiempoPreparacionMin || 0) + (receta.tiempoCoccionMin || 0);

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onSelect(receta)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(receta);
        }
      }}
      className="group cursor-pointer flex flex-col overflow-hidden rounded-2xl border border-[#e4e2e1] bg-white text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#154212]"
      aria-label={`Ver receta de ${receta.plato.nombre}`}
    >
      {/* Banner de imagen */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
        {receta.plato.imagenUrl ? (
          <img
            src={receta.plato.imagenUrl}
            alt={receta.plato.nombre}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#f4f3f0] text-gray-400">
            <span className="material-symbols-outlined text-4xl">restaurant</span>
          </div>
        )}

        {/* Badge de categoría */}
        {categoryName && (
          <span className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-[#154212] shadow-sm">
            {categoryName}
          </span>
        )}

        {/* Badge de duración */}
        {totalMinutes > 0 && (
          <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-sm px-2.5 py-0.5 text-xs font-medium text-white shadow-sm">
            <span className="material-symbols-outlined text-[14px]">schedule</span>
            {totalMinutes} min
          </span>
        )}
      </div>

      {/* Contenido principal */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#154212] transition-colors line-clamp-1">
          {receta.plato.nombre}
        </h3>

        <p className="mt-1.5 text-sm text-gray-600 line-clamp-2 flex-1">
          {receta.plato.descripcion || 'Sin descripción disponible.'}
        </p>

        {/* Pie de la tarjeta: Valoración y Origen/Dificultad */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
          <div className="flex items-center gap-1 text-amber-600 font-semibold">
            <span>★</span>
            <span>{receta.calificacionPromedio.toFixed(1)}</span>
            <span className="text-gray-400 font-normal">({receta.totalCalificaciones})</span>
          </div>

          <div className="flex items-center gap-2 text-gray-500">
            {originName && <span>{originName}</span>}
            {originName && difficultyName && <span>•</span>}
            {difficultyName && <span>{difficultyName}</span>}
          </div>
        </div>
      </div>
    </article>
  );
}
