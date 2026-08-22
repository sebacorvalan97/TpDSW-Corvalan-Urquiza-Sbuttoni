import { useState, useMemo } from 'react';
import type { 
  Receta, 
  Categoria, 
  Origen, 
  Dificultad, 
  Ingrediente, 
  Usuario, 
  Comentario 
} from './types';

import { 
  INITIAL_CATEGORIAS, 
  INITIAL_ORIGENES, 
  INITIAL_DIFICULTADES, 
  INITIAL_INGREDIENTES, 
  INITIAL_RECETAS, 
  INITIAL_USUARIOS, 
  INITIAL_COMENTARIOS 
} from './data/mockData';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import RecipeCard from './components/RecipeCard';
import RecipeDetailModal from './components/RecipeDetailModal';
import RecipeWizardModal from './components/RecipeWizardModal';
import AdminCrudPanel from './components/AdminCrudPanel';
import CommunityRanking from './components/CommunityRanking';
import SubstitutesDirectory from './components/SubstitutesDirectory';
import UserCrud from './components/UserCrud';

export default function App() {
  // Global App States
  const [recetas, setRecetas] = useState<Receta[]>(INITIAL_RECETAS);
  const [categorias, setCategorias] = useState<Categoria[]>(INITIAL_CATEGORIAS);
  const [origenes, setOrigenes] = useState<Origen[]>(INITIAL_ORIGENES);
  const [dificultades, setDificultades] = useState<Dificultad[]>(INITIAL_DIFICULTADES);
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>(INITIAL_INGREDIENTES);
  const [usuarios, setUsuarios] = useState<Usuario[]>(INITIAL_USUARIOS);
  const [comentarios, setComentarios] = useState<Comentario[]>(INITIAL_COMENTARIOS);

  const [currentUser, setCurrentUser] = useState<Usuario>(INITIAL_USUARIOS[0]);
  const [currentTab, setCurrentTab] = useState<'recipes' | 'ranking' | 'create' | 'admin' | 'substitutes' | 'favorites'>('recipes');

  // Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedOrigin, setSelectedOrigin] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedMaxTime, setSelectedMaxTime] = useState<number | 'all'>('all');

  // Modals State
  const [selectedRecipe, setSelectedRecipe] = useState<Receta | null>(null);
  const [isCookingDirect, setIsCookingDirect] = useState<boolean>(false);
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [editingRecipe, setEditingRecipe] = useState<Receta | null>(null);

  // Quick categories metadata with Material icons
  const quickCategories = [
    { id: 'cat-pastas', label: 'Pastas', icon: 'local_pizza' },
    { id: 'cat-saludable', label: 'Vegano', icon: 'eco' },
    { id: 'cat-postres', label: 'Postres', icon: 'cake' },
    { id: 'cat-carnes', label: 'Cena', icon: 'dinner_dining' },
    { id: 'cat-mexicana', label: 'Mexicana', icon: 'restaurant' },
    { id: 'cat-asiatica', label: 'Asiático', icon: 'ramen_dining' }
  ];

  // Toggle favorite
  const handleToggleFavorite = (recetaId: string) => {
    setRecetas((prev) =>
      prev.map((r) =>
        r.id === recetaId ? { ...r, esFavorito: !r.esFavorito } : r
      )
    );
  };

  // Add Comment & Rating
  const handleAddComment = (recetaId: string, rating: number, text: string) => {
    const newComment: Comentario = {
      id: 'com-' + Date.now(),
      recetaId,
      usuarioId: currentUser.id,
      nombreUsuario: currentUser.nombre,
      avatarUsuario: currentUser.avatar,
      calificacion: rating,
      texto: text,
      fecha: new Date().toISOString().split('T')[0],
      likes: 0
    };

    const updatedComments = [newComment, ...comentarios];
    setComentarios(updatedComments);

    const recipeComments = updatedComments.filter((c) => c.recetaId === recetaId);
    const avg = recipeComments.reduce((acc, c) => acc + c.calificacion, 0) / recipeComments.length;

    setRecetas((prev) =>
      prev.map((r) =>
        r.id === recetaId
          ? {
              ...r,
              calificacionPromedio: avg,
              totalCalificaciones: recipeComments.length
            }
          : r
      )
    );

    if (selectedRecipe && selectedRecipe.id === recetaId) {
      setSelectedRecipe((prev) => prev ? {
        ...prev,
        calificacionPromedio: avg,
        totalCalificaciones: recipeComments.length
      } : null);
    }
  };

  const handleLikeComment = (comentarioId: string) => {
    setComentarios((prev) =>
      prev.map((c) =>
        c.id === comentarioId ? { ...c, likes: c.likes + 1 } : c
      )
    );
  };

  // Save Recipe (Create or Update)
  const handleSaveRecipe = (recipeData: Partial<Receta>) => {
    if (editingRecipe) {
      setRecetas((prev) =>
        prev.map((r) => (r.id === editingRecipe.id ? { ...r, ...recipeData } as Receta : r))
      );
      setEditingRecipe(null);
    } else {
      const newRec: Receta = {
        id: 'rec-' + Date.now(),
        platoId: recipeData.plato?.id || 'plt-' + Date.now(),
        plato: recipeData.plato!,
        tiempoPreparacionMin: recipeData.tiempoPreparacionMin || 20,
        tiempoCoccionMin: recipeData.tiempoCoccionMin || 25,
        porcionesBase: recipeData.porcionesBase || 4,
        ingredientes: recipeData.ingredientes || [],
        pasos: recipeData.pasos || [],
        calificacionPromedio: 5.0,
        totalCalificaciones: 1,
        creadorUsuarioId: currentUser.id,
        creadorNombre: currentUser.nombre,
        esFavorito: false
      };
      setRecetas([newRec, ...recetas]);
    }
    setIsWizardOpen(false);
  };

  const handleDeleteRecipe = (recetaId: string) => {
    setRecetas((prev) => prev.filter((r) => r.id !== recetaId));
  };

  const handleAddSubstitute = (
    ingredienteId: string,
    nombreSustituto: string,
    proporcion: string,
    notas: string
  ) => {
    setIngredientes((prev) =>
      prev.map((ing) => {
        if (ing.id === ingredienteId) {
          const newSub = {
            id: 'sub-' + Date.now(),
            ingredientePrincipalId: ingredienteId,
            nombreSustituto,
            proporcion,
            notas
          };
          return {
            ...ing,
            sustitutos: [...(ing.sustitutos || []), newSub]
          };
        }
        return ing;
      })
    );
  };

  const handleCreateIngredientFromWizard = (nombre: string, unidad: string) => {
    const newIng: Ingrediente = {
      id: 'ing-' + Date.now(),
      nombre,
      unidadMedidaDefecto: unidad,
      sustitutos: []
    };
    setIngredientes((prev) => [...prev, newIng]);
    return newIng;
  };

  // Filtered Recipes Calculation
  const filteredRecetas = useMemo(() => {
    return recetas.filter((r) => {
      if (currentTab === 'favorites' && !r.esFavorito) return false;

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

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
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
    currentTab,
    selectedCategory,
    selectedOrigin,
    selectedDifficulty,
    selectedMaxTime,
    searchQuery,
    categorias,
    origenes
  ]);

  const favoritesCount = recetas.filter((r) => r.esFavorito).length;

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedOrigin('all');
    setSelectedDifficulty('all');
    setSelectedMaxTime('all');
  };

  // Featured Recipe for the top banner (pick top rated or first)
  const featuredRecipe = recetas[0];

  return (
    <div className="min-h-screen bg-[#fbf9f8] text-[#1b1c1c] flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          if (tab === 'create') {
            setEditingRecipe(null);
            setIsWizardOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        allUsers={usuarios}
        favoritesCount={favoritesCount}
      />

      {/* Main Container with Sidebar + Canvas */}
      <div className="flex max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-12 py-6 gap-8 flex-1">
        
        {/* Left Sidebar (Desktop) */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={(tab) => {
            if (tab === 'create') {
              setEditingRecipe(null);
              setIsWizardOpen(true);
            } else {
              setCurrentTab(tab);
            }
          }}
          currentUser={currentUser}
          favoritesCount={favoritesCount}
          onSelectTag={(tag) => {
            setCurrentTab('recipes');
            setSearchQuery(tag);
          }}
        />

        {/* Center / Main Content Canvas */}
        <main className="flex-1 min-w-0 space-y-8">
          
          {/* VIEW: DISCOVER / RECIPES / FAVORITES */}
          {(currentTab === 'recipes' || currentTab === 'favorites') && (
            <>
              {/* FEATURED HERO BANNER (matching guide) */}
              {featuredRecipe && currentTab === 'recipes' && !searchQuery && selectedCategory === 'all' && (
                <section className="relative w-full h-[360px] sm:h-[420px] md:h-[460px] rounded-2xl overflow-hidden shadow-lg group border border-[#c2c9bb]/30">
                  <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url('${featuredRecipe.plato.imagenUrl}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 p-6 sm:p-8 md:p-10 text-white max-w-2xl">
                    <div className="flex gap-2 mb-3">
                      <span className="bg-[#6d4820]/90 backdrop-blur-md text-[#ecb987] px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                        Destacado de Hoy
                      </span>
                      <span className="bg-[#154212]/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                        Selección Saludable
                      </span>
                    </div>

                    <h1 className="font-serif-display text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-2">
                      {featuredRecipe.plato.nombre}
                    </h1>

                    <p className="text-xs sm:text-sm text-white/90 mb-4 line-clamp-2 leading-relaxed">
                      {featuredRecipe.plato.descripcion}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        <span>{featuredRecipe.tiempoPreparacionMin + featuredRecipe.tiempoCoccionMin} Mins</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">trending_up</span>
                        <span>Dificultad Intermedia</span>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedRecipe(featuredRecipe);
                          setIsCookingDirect(true);
                        }}
                        className="ml-auto bg-white text-[#154212] px-5 py-2.5 rounded-lg font-bold hover:bg-[#bcf0ae] transition-colors flex items-center gap-2 shadow-md active:scale-95"
                      >
                        <span>Cocinar Ahora</span>
                        <span className="material-symbols-outlined text-base">play_circle</span>
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {/* QUICK CATEGORIES (matching guide) */}
              <section className="space-y-3">
                <div className="flex justify-between items-end">
                  <h2 className="font-serif-display text-xl md:text-2xl font-bold text-[#154212]">
                    Categorías Rápidas
                  </h2>
                  {(selectedCategory !== 'all' || selectedOrigin !== 'all' || selectedDifficulty !== 'all' || selectedMaxTime !== 'all' || searchQuery) && (
                    <button
                      onClick={resetFilters}
                      className="text-xs font-bold text-[#154212] hover:underline"
                    >
                      Borrar filtros
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {quickCategories.map((item) => {
                    const isSelected = selectedCategory === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedCategory(isSelected ? 'all' : item.id)}
                        className="group cursor-pointer"
                      >
                        <div className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md ${
                          isSelected
                            ? 'bg-[#bcf0ae] border-[#154212] shadow-sm'
                            : 'bg-white border-[#c2c9bb] hover:bg-[#f6f3f2]'
                        }`}>
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-[#154212] text-[#bcf0ae]' : 'bg-[#f0eded] text-[#154212] group-hover:bg-white'
                          }`}>
                            <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                          </div>
                          <span className={`text-xs font-semibold ${isSelected ? 'text-[#154212] font-bold' : 'text-[#605e5b] group-hover:text-[#154212]'}`}>
                            {item.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* SEARCH & FILTERS SECTION */}
              <section className="bg-white p-4 rounded-2xl border border-[#c2c9bb]/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#72796e] text-lg pointer-events-none">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar recetas, ingredientes o cocinas..."
                    className="w-full bg-[#fbf9f8] border border-[#c2c9bb] rounded-xl py-3 pl-11 pr-4 text-xs sm:text-sm text-[#1b1c1c] focus:ring-2 focus:ring-[#154212] focus:outline-hidden transition-all"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Category select */}
                  <div className="relative">
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
                  </div>

                  {/* Difficulty select */}
                  <div className="relative">
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
                  </div>

                  {/* Origin select */}
                  <div className="relative">
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
                  </div>

                  {/* Max Time select */}
                  <div className="relative">
                    <select
                      value={selectedMaxTime}
                      onChange={(e) => setSelectedMaxTime(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                      className="bg-[#fbf9f8] border border-[#c2c9bb] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#42493e] focus:outline-hidden"
                    >
                      <option value="all">Cualquier Tiempo</option>
                      <option value="25">≤ 25 min (Express)</option>
                      <option value="45">≤ 45 min</option>
                      <option value="60">≤ 60 min</option>
                    </select>
                  </div>

                  <div className="h-5 w-px bg-[#c2c9bb] mx-1 hidden sm:block" />

                  <button
                    onClick={resetFilters}
                    className="text-[#154212] text-xs font-bold hover:underline"
                  >
                    Borrar todo
                  </button>

                  <span className="ml-auto text-xs text-[#605e5b]">
                    Mostrando <strong>{filteredRecetas.length}</strong> de {recetas.length} recetas
                  </span>
                </div>
              </section>

              {/* RECIPES RESULTS GRID */}
              <section className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="font-serif-display text-xl md:text-2xl font-bold text-[#154212]">
                      {currentTab === 'favorites' ? 'Tus Recetas Favoritas' : 'Últimas Recetas'}
                    </h2>
                    <p className="text-xs text-[#605e5b]">
                      Frescas y seleccionadas para tu viaje culinario
                    </p>
                  </div>
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
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 rounded-lg bg-[#154212] text-white text-xs font-bold hover:bg-[#2d5a27]"
                    >
                      Restablecer Filtros
                    </button>
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
                        onSelect={(r) => {
                          setSelectedRecipe(r);
                          setIsCookingDirect(false);
                        }}
                        onToggleFavorite={handleToggleFavorite}
                        onStartCooking={(r) => {
                          setSelectedRecipe(r);
                          setIsCookingDirect(true);
                        }}
                      />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          {/* VIEW: COMMUNITY RANKING */}
          {currentTab === 'ranking' && (
            <CommunityRanking
              recetas={recetas}
              categorias={categorias}
              origenes={origenes}
              onSelectRecipe={(r) => {
                setSelectedRecipe(r);
                setIsCookingDirect(false);
              }}
            />
          )}

          {/* VIEW: SUBSTITUTES / DESPENSA */}
          {currentTab === 'substitutes' && (
            <SubstitutesDirectory
              ingredientes={ingredientes}
              onAddSubstitute={handleAddSubstitute}
            />
          )}

          {/* VIEW: ADMIN CRUD PANEL */}
          {currentTab === 'admin' && (
            <>
              <UserCrud />
              <AdminCrudPanel
              recetas={recetas}
              categorias={categorias}
              origenes={origenes}
              dificultades={dificultades}
              ingredientes={ingredientes}
              usuarios={usuarios}
              comentarios={comentarios}
              setRecetas={setRecetas}
              setCategorias={setCategorias}
              setOrigenes={setOrigenes}
              setDificultades={setDificultades}
              setIngredientes={setIngredientes}
              setUsuarios={setUsuarios}
              setComentarios={setComentarios}
              onOpenCreateRecipe={() => {
                setEditingRecipe(null);
                setIsWizardOpen(true);
              }}
              onEditRecipe={(r) => {
                setEditingRecipe(r);
                setIsWizardOpen(true);
              }}
              />
            </>
          )}

        </main>
      </div>

      {/* Floating Action Button for Mobile Add Recipe */}
      <button
        onClick={() => {
          setEditingRecipe(null);
          setIsWizardOpen(true);
        }}
        className="lg:hidden fixed bottom-20 right-6 bg-[#154212] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all z-40"
        title="Crear nueva receta"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-xl border-t border-[#e4e2e1]">
        <button
          onClick={() => setCurrentTab('favorites')}
          className={`flex flex-col items-center justify-center ${
            currentTab === 'favorites' ? 'text-[#154212] font-bold' : 'text-[#605e5b]'
          }`}
        >
          <span className="material-symbols-outlined">menu_book</span>
          <span className="text-[10px]">Mis Recetas</span>
        </button>

        <button
          onClick={() => setCurrentTab('recipes')}
          className={`flex flex-col items-center justify-center px-3 py-1 rounded-full ${
            currentTab === 'recipes' ? 'bg-[#2d5a27] text-[#ffffff] font-bold' : 'text-[#605e5b]'
          }`}
        >
          <span className="material-symbols-outlined">explore</span>
          <span className="text-[10px]">Descubrir</span>
        </button>

        <button
          onClick={() => {
            setEditingRecipe(null);
            setIsWizardOpen(true);
          }}
          className="flex flex-col items-center justify-center text-[#154212] font-bold"
        >
          <span className="material-symbols-outlined text-2xl">add_circle</span>
          <span className="text-[10px]">Crear</span>
        </button>

        <button
          onClick={() => setCurrentTab('ranking')}
          className={`flex flex-col items-center justify-center ${
            currentTab === 'ranking' ? 'text-[#154212] font-bold' : 'text-[#605e5b]'
          }`}
        >
          <span className="material-symbols-outlined">military_tech</span>
          <span className="text-[10px]">Ranking</span>
        </button>

        <button
          onClick={() => setCurrentTab('substitutes')}
          className={`flex flex-col items-center justify-center ${
            currentTab === 'substitutes' ? 'text-[#154212] font-bold' : 'text-[#605e5b]'
          }`}
        >
          <span className="material-symbols-outlined">kitchen</span>
          <span className="text-[10px]">Despensa</span>
        </button>
      </nav>

      {/* MODAL: RECIPE DETAIL (Bento Layout with Cooking Mode) */}
      {selectedRecipe && (
        <RecipeDetailModal
          receta={selectedRecipe}
          categorias={categorias}
          origenes={origenes}
          dificultades={dificultades}
          todosIngredientes={ingredientes}
          comentarios={comentarios}
          currentUser={currentUser}
          onClose={() => setSelectedRecipe(null)}
          onToggleFavorite={handleToggleFavorite}
          onAddComment={handleAddComment}
          onLikeComment={handleLikeComment}
          onEditRecipe={(r) => {
            setSelectedRecipe(null);
            setEditingRecipe(r);
            setIsWizardOpen(true);
          }}
          onDeleteRecipe={handleDeleteRecipe}
          initialCookingMode={isCookingDirect}
        />
      )}

      {/* MODAL: RECIPE WIZARD (Create / Edit Multi-Step Form) */}
      {isWizardOpen && (
        <RecipeWizardModal
          initialRecipe={editingRecipe}
          categorias={categorias}
          origenes={origenes}
          dificultades={dificultades}
          ingredientesCatalogo={ingredientes}
          currentUser={currentUser}
          onClose={() => {
            setIsWizardOpen(false);
            setEditingRecipe(null);
          }}
          onSaveRecipe={handleSaveRecipe}
          onCreateIngredient={handleCreateIngredientFromWizard}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto bg-[#154212] text-white/80 text-xs py-8 border-t border-[#23501e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="font-serif-display text-lg font-bold text-white">El Bodegón Digital</span>
            <p className="text-[11px] text-[#bcf0ae] mt-0.5">
              Trabajo Práctico DSW • UTN FRT • Corvalan, Sbuttoni, Urquiza
            </p>
          </div>
          <div className="text-[11px] text-right text-white/70">
            <p>Alcance Mínimo (Regularidad) & Adicionales de Aprobación</p>
            <p>React 19 • Tailwind CSS • Material Symbols</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
