import { useState, useMemo } from 'react';
import type {
  Receta,
  Categoria,
  Origen,
  Dificultad,
  Ingrediente,
  Usuario,
  Comentario,
} from './types';

import {
  INITIAL_CATEGORIAS,
  INITIAL_ORIGENES,
  INITIAL_DIFICULTADES,
  INITIAL_INGREDIENTES,
  INITIAL_RECETAS,
  INITIAL_USUARIOS,
  INITIAL_COMENTARIOS,
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
import RecipeDiscover from './components/RecipeDiscover';
import PlatoCrud from './components/PlatoCrud';
import PasoRecetaCrud from './components/PasoRecetaCrud';
import RecetaCrud from './components/RecetaCrud';
import AgregarIngredientesAReceta from './components/AgregarIngredientesAReceta';

type AppTab =
  | 'recipes'
  | 'ranking'
  | 'create'
  | 'admin'
  | 'substitutes'
  | 'favorites'
  | 'discover';

export default function App() {
  // Estados globales de la aplicación: recetas y catálogos compartidos entre las pantallas.
  const [recetas, setRecetas] = useState<Receta[]>(INITIAL_RECETAS);
  const [categorias, setCategorias] = useState<Categoria[]>(INITIAL_CATEGORIAS);
  const [origenes, setOrigenes] = useState<Origen[]>(INITIAL_ORIGENES);
  const [dificultades, setDificultades] =
    useState<Dificultad[]>(INITIAL_DIFICULTADES);
  const [ingredientes, setIngredientes] =
    useState<Ingrediente[]>(INITIAL_INGREDIENTES);
  const [usuarios, setUsuarios] = useState<Usuario[]>(INITIAL_USUARIOS);
  const [comentarios, setComentarios] =
    useState<Comentario[]>(INITIAL_COMENTARIOS);

  const [currentUser, setCurrentUser] = useState<Usuario>(INITIAL_USUARIOS[0]);
  const [currentTab, setCurrentTab] = useState<AppTab>('discover');

  // Criterios usados para filtrar las recetas de las vistas que ofrecen búsqueda.
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedOrigin, setSelectedOrigin] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedMaxTime, setSelectedMaxTime] = useState<number | 'all'>('all');

  // Controla la receta seleccionada y la apertura de los modales y del asistente de creación.
  const [selectedRecipe, setSelectedRecipe] = useState<Receta | null>(null);
  const [isCookingDirect, setIsCookingDirect] = useState<boolean>(false);
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [editingRecipe, setEditingRecipe] = useState<Receta | null>(null);

  // Categorías destacadas con etiquetas e iconos para los accesos rápidos del catálogo.
  const quickCategories = [
    { id: 'cat-pastas', label: 'Pastas', icon: 'local_pizza' },
    { id: 'cat-saludable', label: 'Vegano', icon: 'eco' },
    { id: 'cat-postres', label: 'Postres', icon: 'cake' },
    { id: 'cat-carnes', label: 'Cena', icon: 'dinner_dining' },
    { id: 'cat-mexicana', label: 'Mexicana', icon: 'restaurant' },
    { id: 'cat-asiatica', label: 'Asiático', icon: 'ramen_dining' },
  ];

  // Alterna el estado de favorito de una receta y actualiza la lista global.
  const handleToggleFavorite = (recetaId: string) => {
    setRecetas((prev) =>
      prev.map((r) =>
        r.id === recetaId ? { ...r, esFavorito: !r.esFavorito } : r,
      ),
    );
  };

  // Registra un comentario y recalcula la calificación promedio de la receta correspondiente.
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
      likes: 0,
    };

    const updatedComments = [newComment, ...comentarios];
    setComentarios(updatedComments);

    const recipeComments = updatedComments.filter(
      (c) => c.recetaId === recetaId,
    );
    const avg =
      recipeComments.reduce((acc, c) => acc + c.calificacion, 0) /
      recipeComments.length;

    setRecetas((prev) =>
      prev.map((r) =>
        r.id === recetaId
          ? {
              ...r,
              calificacionPromedio: avg,
              totalCalificaciones: recipeComments.length,
            }
          : r,
      ),
    );

    if (selectedRecipe && selectedRecipe.id === recetaId) {
      setSelectedRecipe((prev) =>
        prev
          ? {
              ...prev,
              calificacionPromedio: avg,
              totalCalificaciones: recipeComments.length,
            }
          : null,
      );
    }
  };

  // Incrementa los "me gusta" del comentario seleccionado.
  const handleLikeComment = (comentarioId: string) => {
    setComentarios((prev) =>
      prev.map((c) =>
        c.id === comentarioId ? { ...c, likes: c.likes + 1 } : c,
      ),
    );
  };

  // Crea una receta nueva o fusiona los cambios con la receta que se está editando.
  const handleSaveRecipe = (recipeData: Partial<Receta>) => {
    if (editingRecipe) {
      setRecetas((prev) =>
        prev.map((r) =>
          r.id === editingRecipe.id ? ({ ...r, ...recipeData } as Receta) : r,
        ),
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
        esFavorito: false,
      };
      setRecetas([newRec, ...recetas]);
    }
    setIsWizardOpen(false);
  };

  // Quita de la lista global la receta identificada.
  const handleDeleteRecipe = (recetaId: string) => {
    setRecetas((prev) => prev.filter((r) => r.id !== recetaId));
  };

  // Añade un sustituto a un ingrediente del catálogo sin modificar los demás ingredientes.
  const handleAddSubstitute = (
    ingredienteId: string,
    nombreSustituto: string,
    proporcion: string,
    notas: string,
  ) => {
    setIngredientes((prev) =>
      prev.map((ing) => {
        if (ing.id === ingredienteId) {
          const newSub = {
            id: 'sub-' + Date.now(),
            ingredientePrincipalId: ingredienteId,
            nombreSustituto,
            proporcion,
            notas,
          };
          return {
            ...ing,
            sustitutos: [...(ing.sustitutos || []), newSub],
          };
        }
        return ing;
      }),
    );
  };

  // Crea un ingrediente desde el asistente, lo agrega al catálogo y lo devuelve al formulario.
  const handleCreateIngredientFromWizard = (nombre: string, unidad: string) => {
    const newIng: Ingrediente = {
      id: 'ing-' + Date.now(),
      nombre,
      unidadMedidaDefecto: unidad,
      sustitutos: [],
    };
    setIngredientes((prev) => [...prev, newIng]);
    return newIng;
  };

  // Filtra recetas por favoritos, categoría, origen, dificultad, tiempo y texto de búsqueda.
  const filteredRecetas = useMemo(() => {
    return recetas.filter((r) => {
      if (currentTab === 'favorites' && !r.esFavorito) return false;

      if (
        selectedCategory !== 'all' &&
        r.plato.categoriaId !== selectedCategory
      ) {
        return false;
      }

      if (selectedOrigin !== 'all' && r.plato.origenId !== selectedOrigin) {
        return false;
      }

      if (
        selectedDifficulty !== 'all' &&
        r.plato.dificultadId !== selectedDifficulty
      ) {
        return false;
      }

      if (
        selectedMaxTime !== 'all' &&
        r.tiempoPreparacionMin + r.tiempoCoccionMin > selectedMaxTime
      ) {
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
        const matchIng = r.ingredientes.some((i) =>
          i.nombre.toLowerCase().includes(query),
        );

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
    origenes,
  ]);

  // Calcula el contador de recetas favoritas que se muestra en la navegación.
  const favoritesCount = recetas.filter((r) => r.esFavorito).length;

  // Restablece todos los filtros y el texto de búsqueda a sus valores iniciales.
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedOrigin('all');
    setSelectedDifficulty('all');
    setSelectedMaxTime('all');
  };

  // Selecciona la primera receta de la lista para mostrarla como receta destacada.
  const featuredRecipe = recetas[0];

  // Prepara el asistente con los catálogos, usuario y acciones que necesita para guardar o navegar.
  const recipeWizard = isWizardOpen ? (
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
      onNavigateDiscover={() => {
        setIsWizardOpen(false);
        setEditingRecipe(null);
        setCurrentTab('discover');
      }}
      onSaveRecipe={handleSaveRecipe}
      onCreateIngredient={handleCreateIngredientFromWizard}
    />
  ) : null;

  // Muestra el asistente como pantalla completa, reemplazando temporalmente la sección actual.
  if (isWizardOpen) {
    return recipeWizard;
  }

  // La vista Descubrir tiene su propio diseño; su acción de crear abre el asistente global.
  if (currentTab === ('discover' as AppTab)) {
    return (
      <RecipeDiscover
        recetas={recetas}
        onAddRecipe={() => {
          setEditingRecipe(null);
          setIsWizardOpen(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf9f8] text-[#1b1c1c] flex flex-col font-sans">
      {/* Navegación principal y búsqueda global de la aplicación. */}
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

      {/* Distribuye la pantalla en menú lateral y área principal de contenido. */}
      <div className="flex max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-12 py-6 gap-8 flex-1">
        {/* Navegación lateral de escritorio y accesos a secciones o etiquetas. */}
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

        {/* Contenedor central que muestra la vista seleccionada por currentTab. */}
        <main className="flex-1 min-w-0 space-y-8">
          {/* Vistas de recetas y favoritos: incluyen destacados, categorías, filtros y resultados. */}
          {(currentTab === 'recipes' || currentTab === 'favorites') && (
            <>
              {/* Banner destacado con acceso directo a iniciar la preparación. */}
              {featuredRecipe &&
                currentTab === 'recipes' &&
                !searchQuery &&
                selectedCategory === 'all' && (
                  <section className="relative w-full h-[360px] sm:h-[420px] md:h-[460px] rounded-2xl overflow-hidden shadow-lg group border border-[#c2c9bb]/30">
                    <div
                      className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                      style={{
                        backgroundImage: `url('${featuredRecipe.plato.imagenUrl}')`,
                      }}
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
                          <span className="material-symbols-outlined text-sm">
                            schedule
                          </span>
                          <span>
                            {featuredRecipe.tiempoPreparacionMin +
                              featuredRecipe.tiempoCoccionMin}{' '}
                            min
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">
                            trending_up
                          </span>
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
                          <span className="material-symbols-outlined text-base">
                            play_circle
                          </span>
                        </button>
                      </div>
                    </div>
                  </section>
                )}

              {/* Accesos para filtrar el listado por categorías comunes. */}
              <section className="space-y-3">
                <div className="flex justify-between items-end">
                  <h2 className="font-serif-display text-xl md:text-2xl font-bold text-[#154212]">
                    Categorías Rápidas
                  </h2>
                  {(selectedCategory !== 'all' ||
                    selectedOrigin !== 'all' ||
                    selectedDifficulty !== 'all' ||
                    selectedMaxTime !== 'all' ||
                    searchQuery) && (
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
                        onClick={() =>
                          setSelectedCategory(isSelected ? 'all' : item.id)
                        }
                        className="group cursor-pointer"
                      >
                        <div
                          className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md ${
                            isSelected
                              ? 'bg-[#bcf0ae] border-[#154212] shadow-sm'
                              : 'bg-white border-[#c2c9bb] hover:bg-[#f6f3f2]'
                          }`}
                        >
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'bg-[#154212] text-[#bcf0ae]'
                                : 'bg-[#f0eded] text-[#154212] group-hover:bg-white'
                            }`}
                          >
                            <span className="material-symbols-outlined text-2xl">
                              {item.icon}
                            </span>
                          </div>
                          <span
                            className={`text-xs font-semibold ${isSelected ? 'text-[#154212] font-bold' : 'text-[#605e5b] group-hover:text-[#154212]'}`}
                          >
                            {item.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Búsqueda y controles de filtrado por categoría, dificultad, origen y tiempo. */}
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

                {/* Controles individuales de filtro y botón para limpiar la selección. */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Filtra por categoría seleccionada. */}
                  <div className="relative">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="bg-[#fbf9f8] border border-[#c2c9bb] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#42493e] focus:outline-hidden"
                    >
                      <option value="all">Todas las Categorías</option>
                      {categorias.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filtra por nivel de dificultad. */}
                  <div className="relative">
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="bg-[#fbf9f8] border border-[#c2c9bb] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#42493e] focus:outline-hidden"
                    >
                      <option value="all">Toda Dificultad</option>
                      {dificultades.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.nivel}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filtra por país de origen. */}
                  <div className="relative">
                    <select
                      value={selectedOrigin}
                      onChange={(e) => setSelectedOrigin(e.target.value)}
                      className="bg-[#fbf9f8] border border-[#c2c9bb] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#42493e] focus:outline-hidden"
                    >
                      <option value="all">Todos los Orígenes</option>
                      {origenes.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.bandera} {o.pais}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Limita los resultados por duración total de preparación y cocción. */}
                  <div className="relative">
                    <select
                      value={selectedMaxTime}
                      onChange={(e) =>
                        setSelectedMaxTime(
                          e.target.value === 'all'
                            ? 'all'
                            : Number(e.target.value),
                        )
                      }
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
                    Mostrando <strong>{filteredRecetas.length}</strong> de{' '}
                    {recetas.length} recetas
                  </span>
                </div>
              </section>

              {/* Resultados: muestra tarjetas para cada coincidencia o un estado sin resultados. */}
              <section className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="font-serif-display text-xl md:text-2xl font-bold text-[#154212]">
                      {currentTab === 'favorites'
                        ? 'Tus Recetas Favoritas'
                        : 'Últimas Recetas'}
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
                      Intenta buscar con otros términos o limpia los filtros
                      seleccionados.
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

          {/* Vista del ranking comunitario de recetas mejor valoradas. */}
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

          {/* Vista del catálogo de ingredientes y sus alternativas o sustitutos. */}
          {currentTab === 'substitutes' && (
            <SubstitutesDirectory
              ingredientes={ingredientes}
              onAddSubstitute={handleAddSubstitute}
            />
          )}

          {/* Herramientas administrativas para gestionar recetas y catálogos. */}
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

      {/* Botón flotante móvil que abre el asistente para crear una receta. */}
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

      {/* Barra de navegación móvil para cambiar de sección o abrir la creación. */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-xl border-t border-[#e4e2e1]">
        <button
          onClick={() => setCurrentTab('favorites')}
          className={`flex flex-col items-center justify-center ${
            currentTab === 'favorites'
              ? 'text-[#154212] font-bold'
              : 'text-[#605e5b]'
          }`}
        >
          <span className="material-symbols-outlined">menu_book</span>
          <span className="text-[10px]">Mis Recetas</span>
        </button>

        <button
          onClick={() => setCurrentTab('discover')}
          className={`flex flex-col items-center justify-center px-3 py-1 rounded-full ${
            currentTab === 'discover'
              ? 'bg-[#2d5a27] text-[#ffffff] font-bold'
              : 'text-[#605e5b]'
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
            currentTab === 'ranking'
              ? 'text-[#154212] font-bold'
              : 'text-[#605e5b]'
          }`}
        >
          <span className="material-symbols-outlined">military_tech</span>
          <span className="text-[10px]">Ranking</span>
        </button>

        <button
          onClick={() => setCurrentTab('substitutes')}
          className={`flex flex-col items-center justify-center ${
            currentTab === 'substitutes'
              ? 'text-[#154212] font-bold'
              : 'text-[#605e5b]'
          }`}
        >
          <span className="material-symbols-outlined">kitchen</span>
          <span className="text-[10px]">Despensa</span>
        </button>
      </nav>

      {/* Detalle de receta: permite consultar, valorar, comentar y entrar al modo de cocina. */}
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

      {/* Punto de montaje del asistente de recetas cuando la vista completa está abierta. */}
      {recipeWizard}

      {/* Pie de página general de la aplicación. */}
      <footer className="mt-auto bg-[#154212] text-white/80 text-xs py-8 border-t border-[#23501e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="font-serif-display text-lg font-bold text-white">
              El Bodegón Digital
            </span>
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
