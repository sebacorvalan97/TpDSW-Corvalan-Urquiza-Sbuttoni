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
  onShowRecipes?: () => void;
  onSearch?: (query: string) => void;
  onToggleFavorite?: (id: string) => void;
  onStartCooking?: (recipe: Receta) => void;
  onNavigateCategories?: () => void;
  onNavigatePantry?: () => void;
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
  onAddRecipe,
  onToggleFavorite,
  onStartCooking,
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
    return recetas.filter((receta) => {
      if (selectedCategory !== 'all' && receta.plato.categoriaId !== selectedCategory) {
        return false;
      }

      if (selectedDifficulty !== 'all' && receta.plato.dificultadId !== selectedDifficulty) {
        return false;
      }

      if (selectedOrigin !== 'all') {
        const matchesPrimary = receta.plato.origenId === selectedOrigin;
        const matchesAny = receta.plato.origenesIds?.includes(selectedOrigin);
        if (!matchesPrimary && !matchesAny) return false;
      }

      if (selectedMaxTime !== 'all') {
        const totalMinutes =
          (receta.tiempoPreparacionMin || 0) + (receta.tiempoCoccionMin || 0);
        if (totalMinutes > selectedMaxTime) return false;
      }

      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchName = receta.plato.nombre.toLowerCase().includes(query);
        const matchDesc = receta.plato.descripcion?.toLowerCase().includes(query);
        const matchIngs = (receta.ingredientes ?? []).some((i) =>
          i.nombre.toLowerCase().includes(query)
        );
        if (!matchName && !matchDesc && !matchIngs) return false;
      }

      return true;
    });
  }, [recetas, selectedCategory, selectedDifficulty, selectedOrigin, selectedMaxTime, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Banner de Bienvenida */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#154212] via-[#24521f] to-[#3a6b33] p-8 md:p-10 text-white shadow-md">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            Comunidad Gastronómica
          </span>
          <h1 className="font-serif-display text-2xl md:text-4xl font-extrabold tracking-tight">
            Descubre y Cocina Platos Extraordinarios
          </h1>
          <p className="text-xs md:text-sm text-white/80 leading-relaxed max-w-xl">
            Explora recetas compartidas por nuestra comunidad, filtra por ingredientes, tiempo o
            dificultad, o comparte tus propias creaciones culinarias.
          </p>
          {onAddRecipe && (
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onAddRecipe}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs md:text-sm font-bold text-[#154212] shadow-sm hover:bg-[#bcf0ae] transition-colors"
              >
                <span className="material-symbols-outlined text-lg">add_circle</span>
                Crear Nueva Receta
              </button>
            </div>
          )}
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 opacity-15 pointer-events-none">
          <span className="material-symbols-outlined text-[280px]">skillet</span>
        </div>
      </section>

      {/* Categorías Rápidas */}
      {quickCategories.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-serif-display text-lg font-bold text-[#154212]">
              Categorías Rápidas
            </h2>
            {selectedCategory !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className="text-xs font-semibold text-[#154212] hover:underline"
              >
                Ver todas
              </button>
            )}
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#154212] text-white shadow-sm'
                  : 'bg-white border border-[#c2c9bb]/60 text-[#42493e] hover:bg-[#f6f3f2]'
              }`}
            >
              <span className="material-symbols-outlined text-base">restaurant</span>
              Todas
            </button>
            {quickCategories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(isSelected ? 'all' : cat.id)}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-[#154212] text-white shadow-sm'
                      : 'bg-white border border-[#c2c9bb]/60 text-[#42493e] hover:bg-[#f6f3f2]'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{cat.icon}</span>
                  {cat.label}
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
              <option key={o.id} value={o.id}>{o.bandera ? `${o.bandera} ` : ''}{o.pais}</option>
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
                onToggleFavorite={onToggleFavorite}
                onStartCooking={onStartCooking}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
