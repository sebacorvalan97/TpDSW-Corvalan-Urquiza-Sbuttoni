import { useState, useMemo, useEffect, useCallback } from 'react';
import type {
  Receta, 
  Categoria, 
  Origen, 
  Dificultad, 
  Ingrediente, 
  Usuario, 
  Comentario,
  CategoriaApi,
  IngredienteApi,
} from './types';

import { INITIAL_USUARIOS } from './data/mockData';
import Navbar from './components/NavBar';
import Sidebar from './components/Sidebar';
import RecipeCard from './components/RecipeCard';
import RecipeDetailModal from './components/RecipeDetailModal';
import RecipeWizardModal from './components/RecipeWizardModal';
import UserManagementCrud from './components/UserManagementCrud';
import AdminManagementCrud from './components/AdminManagementCrud';
import CommunityRanking from './components/CommunityRanking';
import SubstitutesDirectory from './components/SubstitutesDirectory';
import UserCrud from './components/UserCrud';
import CategoryCrud from './components/CategoryCrud';
import IngredientCrud from './components/IngredientCrud';
import SubstituteIngredientCrud from './components/SubstituteIngredientCrud';
import RecipeDiscover from './components/RecipeDiscover';
import FavoriteRecipes from './components/FavoriteRecipes';
import RecipeCatalogCrud from './components/RecipeCatalogCrud';
import AuthPanel, { type AuthSession } from './components/AuthPanel';
import { recetaService } from './services/receta.service';
import { categoryService } from './services/category.service';
import { ingredientService } from './services/ingredient.service';
import { recipeCatalogService } from './services/recipe-catalog.service';
import { userDataService, type CommentApi } from './services/user-data.service';
import { UNIDADES_MEDIDA } from './constants/unidades';
import { API_BASE } from './services/http';
import { getCountryFlag } from './utils/flags';

type AppTab = 'recipes' | 'ranking' | 'create' | 'register' | 'auth' | 'admin' | 'substitutes' | 'favorites' | 'discover';

const SESSION_KEY = 'bodegon-session';

const toUiRecipe = (apiRecipe: Awaited<ReturnType<typeof recetaService.getAllRecetas>>[number]): Receta => {
  const recipeId = String(apiRecipe.idRecipe);
  const dishId = String(apiRecipe.idDish);
  return {
    id: `rec-${recipeId}`,
    platoId: dishId,
    plato: {
      id: dishId,
      nombre: apiRecipe.nombre,
      descripcion: apiRecipe.descripcion,
      imagenUrl: apiRecipe.imagenUrl,
      categoriaId: apiRecipe.idCategory === null ? '' : String(apiRecipe.idCategory),
      origenId: apiRecipe.origins[0] ? String(apiRecipe.origins[0].idOrigin) : '',
      origenesIds: apiRecipe.origins.map((o) => String(o.idOrigin)),
      dificultadId: apiRecipe.idDifficulty === null ? '' : String(apiRecipe.idDifficulty),
    },
    tiempoPreparacionMin: apiRecipe.tiempoMinutos,
    tiempoCoccionMin: 0,
    porcionesBase: 1,
    ingredientes: apiRecipe.ingredients.map((ingredient) => ({
      id: String(ingredient.idIngredient),
      nombre: ingredient.nombre,
      unidadMedidaDefecto: ingredient.unidadMedidaDefecto,
      cantidad: ingredient.cantidad,
      unidad: ingredient.unidad,
      sustitutos: [],
    })),
    pasos: apiRecipe.steps.map((step) => step.descripcion),
    calificacionPromedio: apiRecipe.ratingAverage,
    totalCalificaciones: apiRecipe.ratingCount,
    creadorUsuarioId: apiRecipe.createdByUserId === null ? '' : `usr-${apiRecipe.createdByUserId}`,
    creadorNombre: apiRecipe.createdByName ?? 'Comunidad',
    esFavorito: false,
  };
};

const toUiComment = (comment: CommentApi, recipeId: number): Comentario => ({
  id: String(comment.id),
  recetaId: `rec-${recipeId}`,
  usuarioId: `usr-${comment.userId}`,
  nombreUsuario: comment.userName,
  avatarUsuario: comment.avatar,
  calificacion: comment.rating,
  texto: comment.text,
  fecha: comment.date,
  likes: comment.likes,
  likedByUser: comment.likedByUser,
});

const readStoredSession = (): AuthSession | null => {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    const session = JSON.parse(stored) as AuthSession;
    if (
      typeof session.token !== 'string' ||
      (session.role !== 'user' && session.role !== 'admin') ||
      typeof session.id !== 'number' ||
      typeof session.name !== 'string' ||
      typeof session.mail !== 'string'
    ) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch (error: unknown) {
    sessionStorage.removeItem(SESSION_KEY);
    console.error('No se pudo restaurar la sesión guardada.', error);
    return null;
  }
};

export default function App() {
  // Global App States
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [origenes, setOrigenes] = useState<Origen[]>([]);
  const [dificultades, setDificultades] = useState<Dificultad[]>([]);
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [favoriteRecipeIds, setFavoriteRecipeIds] = useState<number[]>([]);

  const [currentUser, setCurrentUser] = useState<Usuario>(() => {
    const storedSession = readStoredSession();
    return storedSession?.role === 'user'
      ? {
          id: `usr-${storedSession.id}`,
          nombre: storedSession.name,
          avatar: INITIAL_USUARIOS[0].avatar,
        }
      : INITIAL_USUARIOS[0];
  });
  const [authSession, setAuthSession] = useState<AuthSession | null>(readStoredSession);
  const [currentTab, setCurrentTab] = useState<AppTab>('discover');
  const [operationError, setOperationError] = useState('');
  const [adminSection, setAdminSection] = useState<'origins-diff' | 'categories' | 'ingredients' | 'substitutes' | 'users' | 'admins' | 'all'>('origins-diff');

  const handleCategoriesChanged = useCallback((items: CategoriaApi[]) => {
    setCategorias(items.map((item) => ({ id: String(item.idCategory), nombre: item.nombre })));
  }, []);

  const handleIngredientsChanged = useCallback((items: IngredienteApi[]) => {
    setIngredientes(items.map((item) => ({
      id: String(item.idIngredient),
      nombre: item.nombre,
      unidadMedidaDefecto: item.unidadMedidaDefecto,
      sustitutos: [],
    })));
  }, []);

  useEffect(() => {
    let isMounted = true;

    void Promise.all([
      recetaService.getAllRecetas(),
      categoryService.getAll(),
      ingredientService.getAll(),
      recipeCatalogService.getOrigins(),
      recipeCatalogService.getDifficulties(),
    ]).then(([apiRecipes, apiCategories, apiIngredients, apiOrigins, apiDifficulties]) => {
      if (!isMounted) return;
      setOperationError('');
      setRecetas(apiRecipes.map(toUiRecipe));
      setCategorias(apiCategories.map((category) => ({ id: String(category.idCategory), nombre: category.nombre })));
      setIngredientes(apiIngredients.map((ingredient) => ({
        id: String(ingredient.idIngredient),
        nombre: ingredient.nombre,
        unidadMedidaDefecto: ingredient.unidadMedidaDefecto,
        sustitutos: [],
      })));
      setOrigenes(apiOrigins.map((origin) => ({ id: String(origin.idOrigin), pais: origin.pais, nombre: origin.nombre, bandera: getCountryFlag(origin.pais) })));
      setDificultades(apiDifficulties.map((difficulty) => ({ id: String(difficulty.idDifficulty), nivel: difficulty.nivel })));
    }).catch((error: unknown) => {
      console.error('No se pudieron cargar las recetas y sus catálogos desde el servidor.', error);
      if (isMounted) {
        setOperationError(error instanceof Error ? error.message : 'No se pudieron cargar las recetas y sus catálogos.');
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (authSession?.role !== 'user') return;
    let isMounted = true;
    void userDataService.getFavorites().then((ids) => {
      if (isMounted) setFavoriteRecipeIds(ids);
    }).catch((cause: unknown) => {
      if (isMounted) setOperationError(cause instanceof Error ? cause.message : 'No se pudieron cargar los favoritos.');
    });
    return () => {
      isMounted = false;
    };
  }, [authSession]);

  const activeFavoriteIds = useMemo(
    () => new Set(authSession?.role === 'user' ? favoriteRecipeIds.map(String) : []),
    [authSession?.role, favoriteRecipeIds]
  );

  const recetasConFavoritos = useMemo(
    () => recetas.map((recipe) => {
      const isFavorite = activeFavoriteIds.has(recipe.id.replace(/^rec-/, ''));
      return recipe.esFavorito === isFavorite ? recipe : { ...recipe, esFavorito: isFavorite };
    }),
    [recetas, activeFavoriteIds]
  );

  useEffect(() => {
    if (!authSession) return;
    const resource = authSession.role === 'admin' ? 'admins' : 'users';
    void fetch(`${API_BASE}/${resource}/me`, {
      headers: { Authorization: `Bearer ${authSession.token}` },
    }).then(async (response) => {
      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem(SESSION_KEY);
        setAuthSession(null);
        setCurrentUser(INITIAL_USUARIOS[0]);
        return;
      }
      if (response.ok && authSession.role === 'user') {
        const user = await response.json() as { idUser: number; name: string };
        setCurrentUser({
          id: `usr-${user.idUser}`,
          nombre: user.name,
          avatar: INITIAL_USUARIOS[0].avatar,
        });
      }
    }).catch((error: unknown) => {
      console.error('No se pudo validar la sesión con el servidor. Se conserva temporalmente la sesión local.', error);
    });
  }, [authSession]);

  const openAuth = () => {
    setCurrentTab('auth');
  };

  const handleAuthSuccess = (session: AuthSession) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setAuthSession(session);
    setFavoriteRecipeIds([]);
    if (session.role === 'user') {
      setCurrentUser({
        id: `usr-${session.id}`,
        nombre: session.name,
        avatar: INITIAL_USUARIOS[0].avatar,
      });
      setCurrentTab('discover');
    } else {
      setCurrentTab('admin');
    }
  };

  const handleLogout = () => {
    if (authSession) {
      const resource = authSession.role === 'admin' ? 'admins' : 'users';
      void fetch(`${API_BASE}/${resource}/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authSession.token}` },
      }).catch((error: unknown) => console.error('No se pudo invalidar la sesión en el servidor.', error));
    }
    sessionStorage.removeItem(SESSION_KEY);
    setAuthSession(null);
    setFavoriteRecipeIds([]);
    setCurrentUser(INITIAL_USUARIOS[0]);
    setCurrentTab('discover');
  };

  // Criterios usados para filtrar las recetas de las vistas que ofrecen búsqueda.
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

  const selectedRecipeId = selectedRecipe?.id ?? null;

  useEffect(() => {
    if (!selectedRecipeId) return;
    let isMounted = true;
    const recipeId = Number(selectedRecipeId.replace(/^rec-/, ''));
    void userDataService.getComments(recipeId).then((apiComments) => {
      if (!isMounted) return;
      setOperationError('');
      setComentarios(apiComments.map((comment) => toUiComment(comment, recipeId)));
    }).catch((cause: unknown) => {
      if (isMounted) setOperationError(cause instanceof Error ? cause.message : 'No se pudieron cargar los comentarios.');
    });
    return () => { isMounted = false; };
  }, [selectedRecipeId, authSession]);

  const navigateTo = (tab: AppTab) => {
    setOperationError('');
    if (tab === 'create') {
      if (!authSession) {
        openAuth();
        return;
      }
      setEditingRecipe(null);
      setIsWizardOpen(true);
      return;
    }
    if (tab === 'admin' && authSession?.role !== 'admin') {
      openAuth();
      return;
    }
    if (tab === 'favorites' && authSession?.role !== 'user') {
      return;
    }
    setCurrentTab(tab);
  };

  const createRecipe = () => {
    if (!authSession) {
      openAuth();
      return;
    }
    setEditingRecipe(null);
    setIsWizardOpen(true);
  };

  // Categorías destacadas dinámicas basadas en la base de datos con iconos representativos
  const quickCategories = useMemo(() => {
    const iconRules: Array<[string, string]> = [
      ['entrada', 'tapas'],
      ['principal', 'dinner_dining'],
      ['postre', 'cake'],
      ['ensalada', 'eco'],
      ['sopa', 'ramen_dining'],
      ['bebida', 'local_bar'],
      ['snack', 'fastfood'],
      ['guarnicion', 'rice_bowl'],
      ['pasta', 'local_pizza'],
      ['carne', 'kebab_dining'],
      ['vegano', 'eco'],
    ];

    return categorias.map((cat) => {
      const lower = cat.nombre.toLowerCase();
      let icon = 'restaurant';
      for (const [key, ic] of iconRules) {
        if (lower.includes(key)) {
          icon = ic;
          break;
        }
      }
      return {
        id: cat.id,
        label: cat.nombre,
        icon,
      };
    });
  }, [categorias]);

  // Toggle favorite
  const handleToggleFavorite = async (recetaId: string) => {
    if (!authSession) {
      setOperationError('Inicia sesión con tu cuenta de usuario para guardar recetas en favoritos.');
      return;
    }
    if (authSession.role !== 'user') {
      setOperationError('Debes ingresar con una cuenta de usuario para guardar favoritos.');
      return;
    }
    try {
      setOperationError('');
      const result = await userDataService.toggleFavorite(Number(recetaId.replace(/^rec-/, '')));
      const recipeId = Number(recetaId.replace(/^rec-/, ''));
      setFavoriteRecipeIds((ids) => result.isFavorite
        ? [...new Set([...ids, recipeId])]
        : ids.filter((id) => id !== recipeId));
    } catch (cause: unknown) {
      setOperationError(cause instanceof Error ? cause.message : 'No se pudo actualizar el favorito.');
    }
  };

  const refreshRecipeCommentsAndRating = async (recetaId: string) => {
    const recipeId = Number(recetaId.replace(/^rec-/, ''));
    const apiComments = await userDataService.getComments(recipeId);
    const loadedComments = apiComments.map((comment) => toUiComment(comment, recipeId));
    setComentarios(loadedComments);
    const average = loadedComments.length
      ? loadedComments.reduce((sum, comment) => sum + comment.calificacion, 0) / loadedComments.length
      : 0;
    setRecetas((previous) => previous.map((recipe) => recipe.id === recetaId
      ? { ...recipe, calificacionPromedio: average, totalCalificaciones: loadedComments.length }
      : recipe));
    setSelectedRecipe((previous) => previous?.id === recetaId
      ? { ...previous, calificacionPromedio: average, totalCalificaciones: loadedComments.length }
      : previous);
  };

  // Add Comment & Rating
  const handleAddComment = async (recetaId: string, rating: number, text: string) => {
    if (!authSession) {
      setOperationError('Inicia sesión con tu cuenta de usuario para publicar un comentario y calificar la receta.');
      return;
    }
    if (authSession.role !== 'user') {
      setOperationError('Debes ingresar con una cuenta de usuario para publicar comentarios.');
      return;
    }
    try {
      setOperationError('');
      const recipeId = Number(recetaId.replace(/^rec-/, ''));
      await userDataService.createComment(recipeId, rating, text);
      await refreshRecipeCommentsAndRating(recetaId);
    } catch (cause: unknown) {
      setOperationError(cause instanceof Error ? cause.message : 'No se pudo guardar el comentario.');
      throw cause;
    }
  };

  const handleUpdateComment = async (comentarioId: string, rating: number, text: string) => {
    if (!selectedRecipe) return;
    try {
      setOperationError('');
      await userDataService.updateComment(Number(comentarioId), rating, text);
      await refreshRecipeCommentsAndRating(selectedRecipe.id);
    } catch (cause: unknown) {
      setOperationError(cause instanceof Error ? cause.message : 'No se pudo actualizar el comentario.');
      throw cause;
    }
  };

  const handleDeleteComment = async (comentarioId: string) => {
    if (!selectedRecipe) return;
    try {
      setOperationError('');
      await userDataService.deleteComment(Number(comentarioId));
      await refreshRecipeCommentsAndRating(selectedRecipe.id);
    } catch (cause: unknown) {
      setOperationError(cause instanceof Error ? cause.message : 'No se pudo eliminar el comentario.');
    }
  };

  const handleLikeComment = async (comentarioId: string) => {
    if (!authSession) {
      setOperationError('Inicia sesión con tu cuenta de usuario para indicar que te gusta un comentario.');
      return;
    }
    if (authSession.role !== 'user') {
      setOperationError('Debes ingresar con una cuenta de usuario para dar "Me gusta" a los comentarios.');
      return;
    }
    try {
      setOperationError('');
      const updated = await userDataService.toggleCommentLike(Number(comentarioId));
      setComentarios((previous) => previous.map((comment) => comment.id === comentarioId
        ? { ...comment, likes: updated.likes, likedByUser: updated.likedByUser }
        : comment));
    } catch (cause: unknown) {
      setOperationError(cause instanceof Error ? cause.message : 'No se pudo registrar la reacción.');
    }
  };

  // Save Recipe (Create or Update)
  const handleSaveRecipe = async (recipeData: Partial<Receta>) => {
    if (!authSession) {
      openAuth();
      return;
    }
    if (!recipeData.plato) throw new Error('Faltan los datos principales de la receta.');
    setOperationError('');
    const requestData = {
      nombre: recipeData.plato.nombre,
      descripcion: recipeData.plato.descripcion,
      imagenUrl: recipeData.plato.imagenUrl,
      duracion: (recipeData.tiempoPreparacionMin ?? 0) + (recipeData.tiempoCoccionMin ?? 0),
      idCategory: recipeData.plato.categoriaId ? Number(recipeData.plato.categoriaId) : null,
      idDifficulty: recipeData.plato.dificultadId ? Number(recipeData.plato.dificultadId) : null,
      idOrigin: recipeData.plato.origenId ? Number(recipeData.plato.origenId) : null,
      ingredients: (recipeData.ingredientes ?? []).map((ingredient) => ({
        idIngredient: Number(ingredient.id),
        cantidad: ingredient.cantidad ?? 1,
        unidad: ingredient.unidad ?? ingredient.unidadMedidaDefecto,
      })),
      steps: recipeData.pasos ?? [],
    };
    const recipeId = Number((editingRecipe?.id ?? recipeData.id ?? '').replace(/^rec-/, ''));
    const savedRecipe = editingRecipe && Number.isInteger(recipeId)
      ? await recetaService.updateComplete(recipeId, requestData)
      : await recetaService.createComplete(requestData);
    const updatedRecipe = toUiRecipe(savedRecipe);
    setRecetas((previous) => editingRecipe
      ? previous.map((recipe) => recipe.id === editingRecipe.id ? { ...updatedRecipe, esFavorito: recipe.esFavorito } : recipe)
      : [updatedRecipe, ...previous]);
    setEditingRecipe(null);
    setIsWizardOpen(false);
  };

  const handleDeleteRecipe = async (recetaId: string) => {
    if (!authSession) {
      openAuth();
      return;
    }
    const recipe = recetas.find((item) => item.id === recetaId);
    if (authSession.role !== 'admin' && recipe?.creadorUsuarioId !== currentUser.id) return;
    try {
      setOperationError('');
      await recetaService.deleteReceta(Number(recetaId.replace(/^rec-/, '')));
      setRecetas((previous) => previous.filter((item) => item.id !== recetaId));
      setSelectedRecipe(null);
    } catch (error: unknown) {
      setOperationError(error instanceof Error ? error.message : 'No se pudo eliminar la receta.');
    }
  };

  const handleCreateIngredientFromWizard = async (nombre: string, unidad: string): Promise<Ingrediente> => {
    if (!authSession) {
      throw new Error('Inicia sesión para poder registrar ingredientes en tu receta.');
    }
    const unitMatch = UNIDADES_MEDIDA.find((u) => u.value === unidad || u.label.toLowerCase() === unidad.toLowerCase());
    const unidadNormalizada = unitMatch ? unitMatch.value : 'unidad';
    const created = await ingredientService.create({
      nombre: nombre.trim(),
      descripcion: '',
      unidadMedidaDefecto: unidadNormalizada,
    });
    const newIngredient: Ingrediente = {
      id: String(created.idIngredient),
      nombre: created.nombre,
      unidadMedidaDefecto: created.unidadMedidaDefecto,
      sustitutos: [],
    };
    setIngredientes((previous) => [...previous, newIngredient]);
    return newIngredient;
  };

  // Filtered Recipes Calculation
  const filteredRecetas = useMemo(() => {
    return recetasConFavoritos.filter((r) => {
      if (currentTab === 'favorites' && !r.esFavorito) return false;

      if (selectedCategory !== 'all' && r.plato.categoriaId !== selectedCategory) {
        return false;
      }

      if (selectedOrigin !== 'all') {
        const matchesPrimary = r.plato.origenId === selectedOrigin;
        const matchesAny = r.plato.origenesIds?.includes(selectedOrigin);
        if (!matchesPrimary && !matchesAny) return false;
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
        const matchCat = cat?.nombre.toLowerCase().includes(query);
        const matchOrig = origenes
          .filter((o) => o.id === r.plato.origenId || r.plato.origenesIds?.includes(o.id))
          .some((o) => o.pais.toLowerCase().includes(query) || (o.nombre && o.nombre.toLowerCase().includes(query)));
        const matchIng = r.ingredientes.some((i) => i.nombre.toLowerCase().includes(query));

        if (!matchName && !matchDesc && !matchCat && !matchOrig && !matchIng) {
          return false;
        }
      }

      return true;
    });
  }, [
    recetasConFavoritos,
    currentTab,
    selectedCategory,
    selectedOrigin,
    selectedDifficulty,
    selectedMaxTime,
    searchQuery,
    categorias,
    origenes
  ]);

  const favoritesCount = recetasConFavoritos.filter((r) => r.esFavorito).length;

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedOrigin('all');
    setSelectedDifficulty('all');
    setSelectedMaxTime('all');
  };

  // Featured Recipe for the top banner (pick top rated or first)
  const featuredRecipe = recetasConFavoritos[0];

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
      onNavigateCategories={() => {
        setIsWizardOpen(false);
        setEditingRecipe(null);
        setCurrentTab('recipes');
        setTimeout(() => {
          const el = document.getElementById('categorias-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 50);
      }}
      onNavigatePantry={() => {
        setIsWizardOpen(false);
        setEditingRecipe(null);
        setCurrentTab('substitutes');
      }}
      onSaveRecipe={handleSaveRecipe}
      onCreateIngredient={handleCreateIngredientFromWizard}
    />
  ) : null;

  // Muestra el asistente como pantalla completa, reemplazando temporalmente la sección actual.
  if (isWizardOpen) {
    return recipeWizard;
  }

  if (currentTab === 'auth') {
    return (
      <div className="min-h-screen bg-[#fbf9f8] px-4 py-12">
        <AuthPanel
          onSuccess={handleAuthSuccess}
          onCancel={() => setCurrentTab('discover')}
          onRegister={() => setCurrentTab('register')}
        />
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-[#fbf9f8] text-[#1b1c1c] flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => navigateTo(tab)}
        favoritesCount={favoritesCount}
        authSession={authSession}
        onSignIn={openAuth}
        onSignOut={handleLogout}
      />

      {/* Main Container with Sidebar + Canvas */}
      <div className="flex max-w-7xl mx-auto w-full px-4 md:px-8 gap-8 flex-1">
        
        {/* Left Sidebar (Desktop) */}
        {currentTab !== 'register' && (
          <Sidebar
            currentTab={currentTab}
            setCurrentTab={(tab) => navigateTo(tab)}
            authSession={authSession}
            favoritesCount={favoritesCount}
            onSelectTag={(tag) => {
              setCurrentTab('recipes');
              setSearchQuery(tag);
            }}
          />
        )}

        {/* Center / Main Content Canvas */}
        <main className="flex-1 min-w-0 space-y-8 py-6">
          {operationError && (
            <div className="flex items-center justify-between rounded-xl bg-[#ffdad6] px-4 py-3 text-sm text-[#93000a] shadow-xs" role="alert">
              <span>{operationError}</span>
              <button
                type="button"
                onClick={() => setOperationError('')}
                className="ml-3 inline-flex text-[#93000a] hover:text-black font-bold text-sm px-1.5 py-0.5 rounded hover:bg-[#ffdad6]/80 transition-colors"
                title="Cerrar mensaje"
                aria-label="Cerrar mensaje"
              >
                ✕
              </button>
            </div>
          )}
          
          {/* VIEW: RECIPES */}
          {currentTab === 'recipes' && (
            <>
              {/* FEATURED HERO BANNER (matching guide) */}
              {featuredRecipe && !searchQuery && selectedCategory === 'all' && (
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
                        <span>{dificultades.find((d) => d.id === featuredRecipe.plato.dificultadId)?.nivel ?? 'Dificultad Intermedia'}</span>
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
              <section id="categorias-section" className="space-y-3 scroll-mt-24">
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
                    className="w-full bg-[#fbf9f8] border border-[#c2c9bb] rounded-xl py-3 pl-11 pr-10 text-xs sm:text-sm text-[#1b1c1c] focus:ring-2 focus:ring-[#154212] focus:outline-hidden transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#e1e3e1] hover:bg-[#c2c9bb] text-[#42493e] flex items-center justify-center text-xs transition-colors"
                      title="Limpiar búsqueda"
                      aria-label="Limpiar búsqueda"
                    >
                      ✕
                    </button>
                  )}
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
                        <option key={o.id} value={o.id}>{o.bandera ? `${o.bandera} ` : ''}{o.pais}{o.nombre ? ` (${o.nombre})` : ''}</option>
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
                      Últimas Recetas
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
                        onToggleFavorite={authSession?.role === 'user' ? handleToggleFavorite : undefined}
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

          {/* VIEW: FAVORITES */}
          {currentTab === 'favorites' && authSession?.role === 'user' && (
            <FavoriteRecipes
              recetas={recetasConFavoritos}
              categorias={categorias}
              origenes={origenes}
              dificultades={dificultades}
              onSelectRecipe={(r) => {
                setSelectedRecipe(r);
                setIsCookingDirect(false);
              }}
              onToggleFavorite={handleToggleFavorite}
              onStartCooking={(r) => {
                setSelectedRecipe(r);
                setIsCookingDirect(true);
              }}
              onExploreRecipes={() => navigateTo('discover')}
            />
          )}

          {/* VIEW: DISCOVER */}
          {currentTab === 'discover' && (
            <RecipeDiscover
              recetas={recetasConFavoritos}
              categorias={categorias}
              origenes={origenes}
              dificultades={dificultades}
              onSelectRecipe={(r) => {
                setSelectedRecipe(r);
                setIsCookingDirect(false);
              }}
              onAddRecipe={createRecipe}
              onToggleFavorite={authSession?.role === 'user' ? handleToggleFavorite : undefined}
              onStartCooking={(r) => {
                setSelectedRecipe(r);
                setIsCookingDirect(true);
              }}
            />
          )}

          {/* VIEW: COMMUNITY RANKING */}
          {currentTab === 'ranking' && (
            <CommunityRanking
              recetas={recetasConFavoritos}
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
              authSession={authSession}
              onSignIn={openAuth}
            />
          )}

          {currentTab === 'register' && (
            <UserCrud onRegistered={handleAuthSuccess} onCancel={() => setCurrentTab('discover')} />
          )}

          {/* Herramientas de catálogo reservadas a administradores autenticados */}
          {currentTab === 'admin' && authSession?.role === 'admin' && (
<div className="space-y-6">
              <div className="rounded-2xl border border-[#c2c9bb]/60 bg-white p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f0eded] pb-4 mb-4">
                  <div>
                    <h1 className="font-serif text-2xl font-bold text-[#154212]">Panel de Administración</h1>
                    <p className="text-xs text-[#605e5b] mt-0.5">Gestiona los catálogos maestros y la configuración culinaria de la plataforma</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingRecipe(null);
                      setIsWizardOpen(true);
                    }}
                    className="flex items-center gap-1.5 self-start sm:self-auto rounded-xl bg-[#154212] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#2d5a27] transition"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    <span>Nueva Receta Oficial</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  {[
                    { id: 'origins-diff', label: '🌍 Orígenes y Dificultades' },
                    { id: 'categories', label: '📁 Categorías' },
                    { id: 'ingredients', label: '🥕 Ingredientes' },
                    { id: 'substitutes', label: '🔄 Sustitutos' },
                    { id: 'users', label: '👥 Usuarios' },
                    { id: 'admins', label: '🛡️ Administradores' },
                    { id: 'all', label: '📋 Ver Todo' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setAdminSection(tab.id as typeof adminSection)}
                      className={`px-3.5 py-2 rounded-xl font-semibold transition ${
                        adminSection === tab.id
                          ? 'bg-[#154212] text-white shadow-xs'
                          : 'bg-[#f6f3f2] text-[#42493e] hover:bg-[#e4e2e1]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {(adminSection === 'users' || adminSection === 'all') && (
                <UserManagementCrud />
              )}

              {(adminSection === 'admins' || adminSection === 'all') && (
                <AdminManagementCrud currentAdminId={authSession.id} />
              )}

              {(adminSection === 'origins-diff' || adminSection === 'all') && (
                <RecipeCatalogCrud
                  origins={origenes}
                  difficulties={dificultades}
                  onOriginsChanged={setOrigenes}
                  onDifficultiesChanged={setDificultades}
                />
              )}

              {(adminSection === 'categories' || adminSection === 'all') && (
                <CategoryCrud onChanged={handleCategoriesChanged} />
              )}

              {(adminSection === 'ingredients' || adminSection === 'all') && (
                <IngredientCrud onChanged={handleIngredientsChanged} />
              )}

              {(adminSection === 'substitutes' || adminSection === 'all') && (
                <SubstituteIngredientCrud onIngredientsChanged={handleIngredientsChanged} />
              )}
            </div>
          )}

        </main>
      </div>

      {/* Floating Action Button for Mobile Add Recipe */}
      <button
        onClick={createRecipe}
        className="lg:hidden fixed bottom-20 right-6 bg-[#154212] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all z-40"
        title="Crear nueva receta"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-xl border-t border-[#e4e2e1]">
        <button
          onClick={() => navigateTo('recipes')}
          className={`flex flex-col items-center justify-center ${
            currentTab === 'recipes' ? 'text-[#154212] font-bold' : 'text-[#605e5b]'
          }`}
        >
          <span className="material-symbols-outlined">menu_book</span>
          <span className="text-[10px]">Recetas</span>
        </button>

        <button
          onClick={() => navigateTo('discover')}
          className={`flex flex-col items-center justify-center px-3 py-1 rounded-full ${
            currentTab === 'discover' ? 'bg-[#2d5a27] text-[#ffffff] font-bold' : 'text-[#605e5b]'
          }`}
        >
          <span className="material-symbols-outlined">explore</span>
          <span className="text-[10px]">Descubrir</span>
        </button>

        <button
          onClick={createRecipe}
          className="flex flex-col items-center justify-center text-[#154212] font-bold"
        >
          <span className="material-symbols-outlined text-2xl">add_circle</span>
          <span className="text-[10px]">Crear</span>
        </button>

        <button
          onClick={() => navigateTo('ranking')}
          className={`flex flex-col items-center justify-center ${
            currentTab === 'ranking' ? 'text-[#154212] font-bold' : 'text-[#605e5b]'
          }`}
        >
          <span className="material-symbols-outlined">military_tech</span>
          <span className="text-[10px]">Ranking</span>
        </button>

        {authSession?.role === 'user' && (
          <button
            onClick={() => navigateTo('favorites')}
            className={`flex flex-col items-center justify-center ${
              currentTab === 'favorites' ? 'text-red-600 font-bold' : 'text-[#605e5b]'
            }`}
          >
            <span className="material-symbols-outlined font-fill">favorite</span>
            <span className="text-[10px]">Favoritas</span>
          </button>
        )}

        {authSession && (
          <button
            onClick={() => navigateTo('substitutes')}
            className={`flex flex-col items-center justify-center ${
              currentTab === 'substitutes' ? 'text-[#154212] font-bold' : 'text-[#605e5b]'
            }`}
          >
            <span className="material-symbols-outlined">kitchen</span>
            <span className="text-[10px]">Despensa</span>
          </button>
        )}
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
          isAdmin={authSession?.role === 'admin'}
          onClose={() => {
            setSelectedRecipe(null);
            setComentarios([]);
            setOperationError('');
          }}
          onToggleFavorite={authSession?.role === 'user' ? handleToggleFavorite : undefined}
          onAddComment={handleAddComment}
          onUpdateComment={handleUpdateComment}
          onDeleteComment={handleDeleteComment}
          onLikeComment={handleLikeComment}
          onEditRecipe={(r) => {
            if (!authSession || (authSession.role !== 'admin' && r.creadorUsuarioId !== currentUser.id)) {
              openAuth();
              return;
            }
            setSelectedRecipe(null);
            setComentarios([]);
            setEditingRecipe(r);
            setIsWizardOpen(true);
          }}
          onDeleteRecipe={handleDeleteRecipe}
          initialCookingMode={isCookingDirect}
          isFavorite={activeFavoriteIds.has(selectedRecipe.id.replace(/^rec-/, ''))}
          errorMessage={operationError}
          canEdit={Boolean(authSession && (authSession.role === 'admin' || selectedRecipe.creadorUsuarioId === currentUser.id))}
          canDelete={Boolean(authSession && (authSession.role === 'admin' || selectedRecipe.creadorUsuarioId === currentUser.id))}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto bg-[#154212] text-white/80 text-xs py-8 border-t border-[#23501e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="font-serif-display text-lg font-bold text-white">El Bodegón Digital</span>
            <p className="text-[11px] text-[#bcf0ae] mt-0.5">
              Trabajo Práctico DSW • UTN FRRo • Corvalan, Sbuttoni, Urquiza
            </p>
          </div>
          <div className="text-[11px] text-right text-white/70">
              
          </div>
        </div>
      </footer>
    </div>
  );
}
