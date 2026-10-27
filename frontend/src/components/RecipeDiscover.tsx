import { useState, useMemo } from 'react';
import type { Categoria, Dificultad, Origen, Receta } from '../types';
import RecipeCard from './RecipeCard';

interface Props {
  recetas: Receta[];
  categorias?: Categoria[];
  origenes?: Origen[];
  dificultades?: Dificultad[];
  onSelectRecipe: (recipe: Receta) => void;
  onAddRecipe?: () => void;
}

const getCategoryIcon = (nombre: string): string => {
  const lower = nombre.toLowerCase();
  if (lower.includes('pasta')) return 'local_pizza';
  if (lower.includes('postre') || lower.includes('dulce')) return 'cake';
  if (lower.includes('ensalada') || lower.includes('vegano')) return 'eco';
  if (lower.includes('principal') || lower.includes('carne') || lower.includes('cena')) return 'dinner_dining';
  if (lower.includes('sopa') || lower.includes('caldo') || lower.includes('ramen')) return 'ramen_dining';
  if (lower.includes('bebida') || lower.includes('trago')) return 'local_bar';
  if (lower.includes('entrada') || lower.includes('snack')) return 'tapas';
  if (lower.includes('guarnicion') || lower.includes('papa')) return 'lunch_dining';
  return 'restaurant';
};

export default function RecipeDiscover({
  recetas,
  categorias = [],
  origenes = [],
  dificultades = [],
  onSelectRecipe,
}: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedOrigin, setSelectedOrigin] = useState<string>('all');
  const [selectedMaxTime, setSelectedMaxTime] = useState<'all' | number>('all');

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedDifficulty('all');
    setSelectedOrigin('all');
    setSelectedMaxTime('all');
  };

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    selectedCategory !== 'all' ||
    selectedDifficulty !== 'all' ||
    selectedOrigin !== 'all' ||
    selectedMaxTime !== 'all';

  const quickCategories = useMemo(() => {
    return categorias.map((cat) => ({
      id: cat.id,
      label: cat.nombre,
      icon: getCategoryIcon(cat.nombre),
    }));
  }, [categorias]);

  const filteredRecetas = useMemo(() => {
    return recetas.filter((r) => {
      if (selectedCategory !== 'all' && r.plato.categoriaId !== selectedCategory) {
        return false;
      }

      if (selectedOrigin !== 'all' && r.plato.origenId !== selectedOrigin) {
        return false;
      }

      if (selectedDifficulty !== 'all' && r.plato.dificultadId !== selectedDifficulty) {
        return false;
      }

      if (selectedMaxTime !== 'all' && (r.tiempoPreparacionMin + r.tiempoCoccionMin) > selectedMaxTime) {
        return false;
      }

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = r.plato.nombre.toLowerCase().includes(query);
        const matchDesc = r.plato.descripcion.toLowerCase().includes(query);
        const cat = categorias.find((c) => c.id === r.plato.categoriaId);
        const orig = origenes.find((o) => o.id === r.plato.origenId);
        const matchCat = cat?.nombre.toLowerCase().includes(query);
        const matchOrig = orig?.pais.toLowerCase().includes(query);
        const matchIng = r.ingredientes.some((i) => i.nombre.toLowerCase().includes(query));

        if (!matchName && !matchDesc && !matchCat && !matchOrig && !matchIng) {
          return false;
        }
      }

      return true;
    });
  }, [
    recetas,
    searchTerm,
    selectedCategory,
    selectedOrigin,
    selectedDifficulty,
    selectedMaxTime,
    categorias,
    origenes,
  ]);

  return (
    <div className="space-y-8">
      {/* Banner Principal de Descubrir (Hero estilizado con paleta de El Bodegón) */}
      <section className="relative w-full h-[220px] sm:h-[260px] rounded-2xl overflow-hidden shadow-lg border border-[#c2c9bb]/30 bg-gradient-to-r from-[#154212] via-[#23501e] to-[#2d5a27] p-6 sm:p-10 flex flex-col justify-end text-white">
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden sm:block">
          <span className="material-symbols-outlined text-[160px]">explore</span>
        </div>
        <div className="relative z-10 max-w-xl">
          <div className="flex gap-2 mb-2">
            <span className="bg-[#6d4820]/90 backdrop-blur-md text-[#ecb987] px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
              Comunidad
            </span>
            <span className="bg-white/20 backdrop-blur-md text-[#bcf0ae] px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
              Nuevos Sabores
            </span>
          </div>
          <h1 className="font-serif-display text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-2">
            Descubrir Recetas
          </h1>
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed line-clamp-2">
            Explora platos preparados por la comunidad de El Bodegón Digital. Encuentra tu próxima comida favorita filtrando por tiempo, origen o ingredientes.
          </p>
        </div>
      </section>

      {/* Selector Rápido de Categorías */}
      {quickCategories.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif-display text-base font-bold text-[#154212]">
              Explorar por Categoría
            </h2>
            {selectedCategory !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className="text-xs text-[#154212] font-semibold hover:underline"
              >
                Ver todas
              </button>
            )}
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {quickCategories.map((item) => {
              const isSelected = selectedCategory === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedCategory(isSelected ? 'all' : item.id)}
                  className="shrink-0 text-left focus:outline-hidden group"
                >
                  <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-[#bcf0ae] border-[#154212] shadow-sm text-[#154212] font-bold'
                      : 'bg-white border-[#c2c9bb] text-[#605e5b] hover:bg-[#f6f3f2] hover:text-[#154212]'
                  }`}>
                    <span className="material-symbols-outlined text-lg">{item.icon}</span>
                    <span className="text-xs font-semibold">{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Barra de Búsqueda y Filtros con diseño unificado */}
      <section className="bg-white p-4 rounded-2xl border border-[#c2c9bb]/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#72796e] text-lg pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar recetas, ingredientes o tipos de cocina..."
            className="w-full bg-[#fbf9f8] border border-[#c2c9bb] rounded-xl py-3 pl-11 pr-4 text-xs sm:text-sm text-[#1b1c1c] focus:ring-2 focus:ring-[#154212] focus:outline-hidden transition-all"
          />
        </div>

        {/* Píldoras de Filtros */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#fbf9f8] border border-[#c2c9bb] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#42493e] focus:outline-hidden"
          >
            <option value="all">Todas las Categorías</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-[#fbf9f8] border border-[#c2c9bb] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#42493e] focus:outline-hidden"
          >
            <option value="all">Toda Dificultad</option>
            {dificultades.map((d) => (
              <option key={d.id} value={d.id}>{d.nivel}</option>
            ))}
          </select>

          <select
            value={selectedOrigin}
            onChange={(e) => setSelectedOrigin(e.target.value)}
            className="bg-[#fbf9f8] border border-[#c2c9bb] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#42493e] focus:outline-hidden"
          >
            <option value="all">Todos los Orígenes</option>
            {origenes.map((o) => (
              <option key={o.id} value={o.id}>{o.bandera} {o.pais}</option>
            ))}
          </select>

          <select
            value={selectedMaxTime}
            onChange={(e) => setSelectedMaxTime(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="bg-[#fbf9f8] border border-[#c2c9bb] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#42493e] focus:outline-hidden"
          >
            <option value="all">Cualquier Tiempo</option>
            <option value="25">≤ 25 min (Express)</option>
            <option value="45">≤ 45 min</option>
            <option value="60">≤ 60 min</option>
            <option value="120">≤ 120 min</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-[#154212] font-semibold hover:underline ml-auto flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">close</span>
              Borrar filtros
            </button>
          )}
        </div>
      </section>

      {/* Cuadrícula de Recetas con RecipeCard */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs text-[#605e5b] font-medium">
            Mostrando {filteredRecetas.length} de {recetas.length} recetas
          </span>
        </div>

        {filteredRecetas.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-[#c2c9bb] p-8 space-y-3">
            <span className="material-symbols-outlined text-4xl text-[#72796e]">
              search_off
            </span>
            <h3 className="font-serif-display text-lg font-bold text-[#154212]">
              No se encontraron recetas
            </h3>
            <p className="text-xs text-[#605e5b] max-w-sm mx-auto">
              Intenta buscar con otros términos o limpia los filtros seleccionados.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 rounded-lg bg-[#154212] text-white text-xs font-bold hover:bg-[#2d5a27] transition-colors"
              >
                Restablecer Filtros
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredRecetas.map((receta) => (
              <RecipeCard
                key={receta.id}
                receta={receta}
                categorias={categorias}
                origenes={origenes}
                dificultades={dificultades}
                onSelect={onSelectRecipe}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
