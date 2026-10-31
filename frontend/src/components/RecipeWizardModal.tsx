import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import type { Categoria, Dificultad, Ingrediente, Origen, Receta, Usuario } from '../types';
import { UNIDADES_MEDIDA } from '../constants/unidades';

// Helper para normalizar cadenas para comparaciones tolerantes
const normalizeText = (text: string) =>
  text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

// Datos y acciones que App entrega al asistente para editar, guardar, cerrar o cambiar de pantalla.
interface Props {
  initialRecipe: Receta | null;
  categorias: Categoria[];
  origenes: Origen[];
  dificultades: Dificultad[];
  ingredientesCatalogo: Ingrediente[];
  currentUser: Usuario;
  onClose: () => void;
  onNavigateDiscover: () => void;
  onNavigateCategories?: () => void;
  onNavigatePantry?: () => void;
  onSaveRecipe: (recipeData: Partial<Receta>) => Promise<void>;
  onCreateIngredient: (nombre: string, unidad: string) => Promise<Ingrediente>;
}

// Valores editables de una fila de ingrediente antes de convertirlos al modelo de receta.
interface IngredienteDraft {
  id: string;
  nombre: string;
  cantidad: string;
  unidad: string;
}

// Identificador estable y texto editable de cada instrucción de preparación.
interface PasoDraft {
  id: string;
  texto: string;
}

// Crea claves estables para que React pueda actualizar filas dinámicas sin confundirlas.
const createId = () => crypto.randomUUID();

// Formulario de pantalla completa para crear una receta nueva o modificar una existente.
export default function RecipeWizardModal(props: Props) {
  const recipe = props.initialRecipe;

  // Estado de los campos generales; se inicializa con los datos de la receta o el primer valor de los catálogos.
  const [nombre, setNombre] = useState(recipe?.plato.nombre ?? '');
  const [descripcion, setDescripcion] = useState(recipe?.plato.descripcion ?? '');
  const [categoriaId, setCategoriaId] = useState(recipe?.plato.categoriaId || (props.categorias[0]?.id ?? ''));
  const [origenId, setOrigenId] = useState(recipe?.plato.origenId || (props.origenes[0]?.id ?? ''));
  const [dificultadId, setDificultadId] = useState(recipe?.plato.dificultadId || (props.dificultades[0]?.id ?? ''));
  const [imagenUrl, setImagenUrl] = useState(recipe?.plato.imagenUrl ?? '');
  const [duracionMinutos, setDuracionMinutos] = useState(
    recipe ? recipe.tiempoPreparacionMin + recipe.tiempoCoccionMin : 30
  );

  // Asegura valores por defecto cuando cargan los catálogos
  useEffect(() => {
    if (!categoriaId && props.categorias.length > 0) {
      setCategoriaId(props.categorias[0].id);
    }
  }, [props.categorias, categoriaId]);

  useEffect(() => {
    if (!origenId && props.origenes.length > 0) {
      setOrigenId(props.origenes[0].id);
    }
  }, [props.origenes, origenId]);

  useEffect(() => {
    if (!dificultadId && props.dificultades.length > 0) {
      setDificultadId(props.dificultades[0].id);
    }
  }, [props.dificultades, dificultadId]);

  // Estado de las listas dinámicas de ingredientes y pasos, con una fila con valores estándar.
  const [ingredientes, setIngredientes] = useState<IngredienteDraft[]>(
    recipe?.ingredientes.length
      ? recipe.ingredientes.map((ingrediente) => ({
          id: createId(),
          nombre: ingrediente.nombre,
          cantidad: ingrediente.cantidad?.toString() ?? '1',
          unidad: ingrediente.unidad ?? ingrediente.unidadMedidaDefecto ?? 'unidad',
        }))
      : [{ id: createId(), nombre: '', cantidad: '1', unidad: 'unidad' }]
  );
  const [pasos, setPasos] = useState<PasoDraft[]>(
    recipe?.pasos.length
      ? recipe.pasos.map((texto) => ({ id: createId(), texto }))
      : [{ id: createId(), texto: '' }]
  );
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Agrega una fila vacía de ingrediente sin manipular directamente el DOM.
  function agregarIngrediente() {
    setIngredientes((actuales) => [
      ...actuales,
      { id: createId(), nombre: '', cantidad: '1', unidad: 'unidad' },
    ]);
  }

  // Modifica los valores de una fila concreta manteniendo inmutables a las demás.
  function actualizarIngrediente(id: string, actualizacion: Partial<IngredienteDraft>) {
    setIngredientes((actuales) =>
      actuales.map((ingrediente) =>
        ingrediente.id === id ? { ...ingrediente, ...actualizacion } : ingrediente
      )
    );
  }

  // Quita una fila de ingrediente conservando al menos una para que el usuario no pierda el campo.
  function eliminarIngrediente(id: string) {
    if (ingredientes.length === 1) return;
    setIngredientes((actuales) => actuales.filter((ingrediente) => ingrediente.id !== id));
  }

  // Agrega una instrucción vacía al final del listado secuencial de pasos.
  function agregarPaso() {
    setPasos((actuales) => [...actuales, { id: createId(), texto: '' }]);
  }

  // Actualiza el texto del paso seleccionado mediante su identificador único.
  function actualizarPaso(id: string, texto: string) {
    setPasos((actuales) =>
      actuales.map((paso) => (paso.id === id ? { ...paso, texto } : paso))
    );
  }

  // Quita un paso de preparación respetando un mínimo de una instrucción obligatoria.
  function eliminarPaso(id: string) {
    if (pasos.length === 1) return;
    setPasos((actuales) => actuales.filter((paso) => paso.id !== id));
  }

  // Valida los datos requeridos, normaliza nombres, crea ingredientes faltantes y guarda la receta.
  async function guardarReceta(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!nombre.trim() || !descripcion.trim()) {
      setError('Completa el nombre y la descripción de la receta.');
      return;
    }

    if (!Number.isFinite(duracionMinutos) || duracionMinutos <= 0) {
      setError('La duración debe ser un número entero mayor que cero.');
      return;
    }

    const ingredientesCompletos = ingredientes.filter((ingrediente) => ingrediente.nombre.trim());
    const pasosCompletos = pasos.map((paso) => paso.texto.trim()).filter(Boolean);

    if (ingredientesCompletos.length === 0) {
      setError('Agrega al menos un ingrediente con nombre.');
      return;
    }

    if (pasosCompletos.length === 0) {
      setError('Agrega al menos un paso con instrucciones.');
      return;
    }

    if (ingredientesCompletos.some((ingredient) => ingredient.cantidad.trim() && (!Number.isFinite(Number(ingredient.cantidad)) || Number(ingredient.cantidad) <= 0))) {
      setError('Las cantidades de los ingredientes deben ser mayores que cero.');
      return;
    }

    // Verifica que las opciones elegidas sigan existiendo en los catálogos recibidos.
    if (!props.categorias.some((categoria) => categoria.id === categoriaId)
      || !props.origenes.some((origen) => origen.id === origenId)
      || !props.dificultades.some((dificultad) => dificultad.id === dificultadId)) {
      setError('Selecciona una categoría, un origen y una dificultad válidos.');
      return;
    }

    // Reutiliza ingredientes conocidos; los nombres nuevos se incorporan al catálogo global.
    setIsSaving(true);
    try {
      const ingredientesGuardados: Ingrediente[] = [];
      for (const ingrediente of ingredientesCompletos) {
        const rawNombre = ingrediente.nombre.trim();
        const unidad = ingrediente.unidad.trim() || 'unidad';
        const norm = normalizeText(rawNombre);

        // Búsqueda tolerante: coincidencia exacta, sin tildes, o plural/singular (ej. "huevos" -> "huevo")
        const existente = props.ingredientesCatalogo.find((item) => {
          const itemNorm = normalizeText(item.nombre);
          return (
            itemNorm === norm ||
            itemNorm === norm.replace(/s$/, '') ||
            itemNorm.replace(/s$/, '') === norm ||
            itemNorm === norm.replace(/es$/, '') ||
            itemNorm.replace(/es$/, '') === norm
          );
        });

        const catalogo = existente
          ?? await props.onCreateIngredient(rawNombre, unidad);

        ingredientesGuardados.push({
          ...catalogo,
          cantidad: ingrediente.cantidad.trim() ? Number(ingrediente.cantidad) : 1,
          unidad,
        });
      }

      // Empaqueta los campos del plato y la receta para que App los persista en la API.
      const platoId = recipe?.plato.id ?? '';
      await props.onSaveRecipe({
        id: recipe?.id,
        platoId,
        plato: {
          id: platoId,
          nombre: nombre.trim(),
          descripcion: descripcion.trim(),
          imagenUrl: imagenUrl.trim(),
          categoriaId,
          origenId,
          dificultadId,
        },
        tiempoPreparacionMin: duracionMinutos,
        tiempoCoccionMin: 0,
        ingredientes: ingredientesGuardados,
        pasos: pasosCompletos,
      });
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar la receta.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fbf9f8] text-[#1b1c1c]">
      {/* Cabecera del asistente: identidad de la aplicación y navegación fluida */}
      <nav className="bg-white/95 backdrop-blur-md shadow-xs docked top-0 z-50 fixed w-full border-b border-[#c2c9bb]/40">
        <div className="flex justify-between items-center w-full px-4 md:px-8 py-3.5 max-w-7xl mx-auto z-50">
          <div
            onClick={props.onClose}
            className="font-serif text-2xl font-bold text-[#154212] cursor-pointer"
          >
            El Bodegón Digital
          </div>
          <div className="hidden md:flex space-x-6 items-center">
            <button
              className="text-[#42493e] font-semibold text-xs pb-0.5 hover:text-[#154212] transition-colors"
              onClick={props.onClose}
              type="button"
            >
              Recetas
            </button>
            <button
              className="text-[#42493e] font-semibold text-xs pb-0.5 hover:text-[#154212] transition-colors"
              onClick={props.onNavigateDiscover}
              type="button"
            >
              Descubrir
            </button>
            <button
              className="text-[#42493e] font-semibold text-xs pb-0.5 hover:text-[#154212] transition-colors"
              onClick={props.onNavigateCategories ?? props.onClose}
              type="button"
            >
              Categorías
            </button>
            <button
              className="text-[#42493e] font-semibold text-xs pb-0.5 hover:text-[#154212] transition-colors"
              onClick={props.onNavigatePantry ?? props.onClose}
              type="button"
            >
              Mi Despensa
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={props.onClose}
              type="button"
              className="flex items-center gap-1 text-xs font-semibold text-[#42493e] hover:text-[#154212] px-3 py-1.5 rounded-lg border border-[#c2c9bb]/60 hover:bg-[#f6f3f2] transition"
            >
              <span className="material-symbols-outlined text-base">close</span>
              <span>Cerrar</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Contenedor principal con panel lateral y formulario */}
      <div className="flex pt-20 pb-28 lg:pt-20 lg:pb-0">
        {/* Menú lateral de escritorio */}
        <aside className="hidden lg:flex flex-col h-[calc(100vh-80px)] w-64 left-0 fixed py-6 px-4 space-y-4 bg-white border-r border-[#c2c9bb]/40">
          <div className="px-2 pb-4 border-b border-[#f0eded]">
            <div className="font-serif text-xl font-bold text-[#154212]">
              {recipe ? 'Editar Receta' : 'Nueva Receta'}
            </div>
            <div className="text-xs text-[#72796e] mt-0.5">
              {recipe ? `Modificando #${recipe.id}` : 'Creación paso a paso'}
            </div>
          </div>
          <nav className="flex-1 space-y-1.5">
            <button
              className="flex w-full items-center space-x-3 px-3.5 py-2.5 text-xs font-semibold text-[#42493e] hover:bg-[#f6f3f2] hover:text-[#154212] transition-colors rounded-xl text-left"
              onClick={props.onClose}
              type="button"
            >
              <span className="material-symbols-outlined text-lg">book</span>
              <span>Mis Recetas</span>
            </button>
            <button
              className="flex w-full items-center space-x-3 px-3.5 py-2.5 text-xs font-semibold text-[#42493e] hover:bg-[#f6f3f2] hover:text-[#154212] transition-colors rounded-xl text-left"
              onClick={props.onNavigateDiscover}
              type="button"
            >
              <span className="material-symbols-outlined text-lg">explore</span>
              <span>Descubrir</span>
            </button>
            <button
              className="flex w-full items-center space-x-3 px-3.5 py-2.5 text-xs font-semibold text-[#42493e] hover:bg-[#f6f3f2] hover:text-[#154212] transition-colors rounded-xl text-left"
              onClick={props.onNavigateCategories ?? props.onClose}
              type="button"
            >
              <span className="material-symbols-outlined text-lg">category</span>
              <span>Categorías</span>
            </button>
            <button
              className="flex w-full items-center space-x-3 px-3.5 py-2.5 text-xs font-semibold text-[#42493e] hover:bg-[#f6f3f2] hover:text-[#154212] transition-colors rounded-xl text-left"
              onClick={props.onNavigatePantry ?? props.onClose}
              type="button"
            >
              <span className="material-symbols-outlined text-lg">kitchen</span>
              <span>Mi Despensa</span>
            </button>
          </nav>
        </aside>

        {/* Formulario central */}
        <main className="flex-1 lg:ml-64 px-4 md:px-8 max-w-4xl mx-auto w-full py-6">
          <div className="mb-6">
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#154212]">
              {recipe ? 'Editar Receta Culinaria' : 'Crear Nueva Receta'}
            </h1>
            <p className="text-xs text-[#605e5b] mt-1">
              Documenta tu plato con ingredientes claros, orígenes e instrucciones precisas.
            </p>
          </div>

          <form className="space-y-6 pb-28" id="recipeForm" onSubmit={guardarReceta}>
            {error && (
              <div className="bg-red-50 border border-red-300 text-red-800 rounded-xl p-4 flex items-start gap-3 shadow-sm animate-in fade-in" role="alert">
                <span className="material-symbols-outlined text-red-600 shrink-0 mt-0.5">error</span>
                <div className="flex-1">
                  <p className="font-bold text-xs">No se pudo guardar la receta</p>
                  <p className="text-xs mt-0.5">{error}</p>
                </div>
                <button
                  className="text-red-500 hover:text-red-700 text-xs font-bold"
                  onClick={() => setError('')}
                  type="button"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Sección 1: Detalles Esenciales */}
            <section className="bg-white p-6 rounded-2xl shadow-xs border border-[#c2c9bb]/50 space-y-5">
              <div className="flex items-center space-x-3 border-b border-[#f0eded] pb-3">
                <div className="bg-[#154212] text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs">1</div>
                <h2 className="font-serif text-lg font-bold text-[#154212]">Detalles Esenciales</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#154212] mb-1">Nombre de la Receta *</label>
                    <input
                      className="w-full bg-[#fbf9f8] border border-[#c2c9bb] rounded-xl px-3.5 py-2.5 text-xs text-[#1b1c1c] focus:border-[#154212] focus:ring-1 focus:ring-[#154212] transition-all"
                      placeholder="ej. Milanesas Napolitanas Caseras"
                      type="text"
                      value={nombre}
                      onChange={(event) => setNombre(event.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#154212] mb-1">Descripción *</label>
                    <textarea
                      className="w-full bg-[#fbf9f8] border border-[#c2c9bb] rounded-xl px-3.5 py-2.5 text-xs text-[#1b1c1c] focus:border-[#154212] focus:ring-1 focus:ring-[#154212] transition-all"
                      placeholder="Describe brevemente este plato tradicional..."
                      rows={3}
                      value={descripcion}
                      onChange={(event) => setDescripcion(event.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#154212] mb-1">Duración Total (minutos) *</label>
                    <input
                      className="w-full bg-[#fbf9f8] border border-[#c2c9bb] rounded-xl px-3.5 py-2.5 text-xs text-[#1b1c1c]"
                      min="1"
                      required
                      type="number"
                      value={duracionMinutos}
                      onChange={(event) => setDuracionMinutos(Number(event.target.value))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#154212] mb-1">Categoría *</label>
                      <select
                        className="w-full bg-[#fbf9f8] border border-[#c2c9bb] rounded-xl px-3 py-2 text-xs text-[#1b1c1c]"
                        value={categoriaId}
                        onChange={(event) => setCategoriaId(event.target.value)}
                        required
                      >
                        <option value="">Seleccionar categoría</option>
                        {props.categorias.map((categoria) => (
                          <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#154212] mb-1">Origen / Región *</label>
                      <select
                        className="w-full bg-[#fbf9f8] border border-[#c2c9bb] rounded-xl px-3 py-2 text-xs text-[#1b1c1c]"
                        value={origenId}
                        onChange={(event) => setOrigenId(event.target.value)}
                        required
                      >
                        <option value="">Seleccionar origen</option>
                        {props.origenes.map((origen) => (
                          <option key={origen.id} value={origen.id}>
                            {origen.bandera ? `${origen.bandera} ` : ''}{origen.pais}{origen.nombre ? ` (${origen.nombre})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#154212] mb-1">Dificultad *</label>
                    <div className="flex space-x-2">
                      {props.dificultades.map((dificultad) => {
                        const isSelected = dificultadId === dificultad.id;
                        return (
                          <button
                            key={dificultad.id}
                            className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-[#154212] text-white border-[#154212] shadow-xs'
                                : 'bg-[#fbf9f8] text-[#42493e] border-[#c2c9bb] hover:bg-[#f6f3f2]'
                            }`}
                            onClick={() => setDificultadId(dificultad.id)}
                            type="button"
                          >
                            {dificultad.nivel}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Foto de portada con vista previa en vivo */}
                <div className="flex flex-col">
                  <label className="block text-xs font-bold text-[#154212] mb-1">Foto de Portada (opcional)</label>
                  <div className="flex-1 min-h-[260px] border-2 border-dashed border-[#c2c9bb] rounded-2xl flex flex-col items-center justify-center bg-[#fbf9f8] p-4 text-center">
                    {imagenUrl.trim() ? (
                      <div className="flex flex-col items-center justify-center w-full">
                        <img
                          src={imagenUrl}
                          alt="Vista previa del plato"
                          className="max-h-40 w-full object-cover rounded-xl shadow-xs border border-[#c2c9bb]/60 mb-2"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setImagenUrl('')}
                          className="text-xs text-red-700 font-semibold hover:underline"
                        >
                          Quitar foto
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-4xl text-[#72796e] mb-2">add_a_photo</span>
                        <p className="text-xs text-[#72796e]">Pega abajo la URL pública de la foto del plato</p>
                      </>
                    )}
                    <input
                      className="mt-3 w-full bg-white border border-[#c2c9bb] rounded-xl px-3 py-2 text-xs text-[#1b1c1c] focus:outline-hidden focus:ring-1 focus:ring-[#154212]"
                      placeholder="https://ejemplo.com/foto-receta.jpg"
                      type="url"
                      value={imagenUrl}
                      onChange={(event) => setImagenUrl(event.target.value)}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Sección 2: Ingredientes */}
            <section className="bg-white p-6 rounded-2xl shadow-xs border border-[#c2c9bb]/50 space-y-4">
              <div className="flex items-center justify-between border-b border-[#f0eded] pb-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-[#154212] text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs">2</div>
                  <h2 className="font-serif text-lg font-bold text-[#154212]">Ingredientes *</h2>
                </div>
                <button
                  className="flex items-center space-x-1.5 text-[#154212] font-bold text-xs hover:bg-[#154212]/10 px-3 py-1.5 rounded-lg transition"
                  onClick={agregarIngrediente}
                  type="button"
                >
                  <span className="material-symbols-outlined text-base">add_circle</span>
                  <span>Añadir Ingrediente</span>
                </button>
              </div>

              <p className="text-xs text-[#72796e] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-[#154212]">info</span>
                Escribe para autocompletar con ingredientes existentes de la despensa.
              </p>

              <datalist id="catalogo-ingredientes-list">
                {props.ingredientesCatalogo.map((item) => (
                  <option key={item.id} value={item.nombre}>
                    {item.nombre} ({item.unidadMedidaDefecto})
                  </option>
                ))}
              </datalist>

              <div className="space-y-3">
                {ingredientes.map((ingrediente) => (
                  <div className="flex items-center gap-2" key={ingrediente.id}>
                    <input
                      className="flex-1 bg-[#fbf9f8] border border-[#c2c9bb] rounded-xl px-3 py-2 text-xs text-[#1b1c1c] focus:outline-hidden focus:ring-1 focus:ring-[#154212]"
                      list="catalogo-ingredientes-list"
                      placeholder="Nombre del ingrediente (ej. Huevo)"
                      type="text"
                      value={ingrediente.nombre}
                      onChange={(event) => {
                        const nuevoNombre = event.target.value;
                        const norm = normalizeText(nuevoNombre);
                        const match = props.ingredientesCatalogo.find((item) => normalizeText(item.nombre) === norm);
                        actualizarIngrediente(ingrediente.id, {
                          nombre: nuevoNombre,
                          ...(match && !ingrediente.unidad ? { unidad: match.unidadMedidaDefecto } : {}),
                        });
                      }}
                      required
                    />
                    <input
                      className="w-20 bg-[#fbf9f8] border border-[#c2c9bb] rounded-xl px-2.5 py-2 text-xs text-[#1b1c1c] text-center"
                      min="0.01"
                      placeholder="Cant."
                      required
                      step="any"
                      type="number"
                      value={ingrediente.cantidad}
                      onChange={(event) => actualizarIngrediente(ingrediente.id, { cantidad: event.target.value })}
                    />
                    <select
                      className="w-28 bg-[#fbf9f8] border border-[#c2c9bb] rounded-xl px-2.5 py-2 text-xs text-[#1b1c1c]"
                      value={ingrediente.unidad}
                      onChange={(event) => actualizarIngrediente(ingrediente.id, { unidad: event.target.value })}
                    >
                      {UNIDADES_MEDIDA.map((unidad) => (
                        <option key={unidad.value} value={unidad.value}>{unidad.label}</option>
                      ))}
                    </select>
                    {ingredientes.length > 1 && (
                      <button
                        className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition"
                        onClick={() => eliminarIngrediente(ingrediente.id)}
                        type="button"
                        title="Eliminar fila"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Sección 3: Pasos de Preparación */}
            <section className="bg-white p-6 rounded-2xl shadow-xs border border-[#c2c9bb]/50 space-y-4">
              <div className="flex items-center justify-between border-b border-[#f0eded] pb-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-[#154212] text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs">3</div>
                  <h2 className="font-serif text-lg font-bold text-[#154212]">Instrucciones Paso a Paso *</h2>
                </div>
                <button
                  className="flex items-center space-x-1.5 text-[#154212] font-bold text-xs hover:bg-[#154212]/10 px-3 py-1.5 rounded-lg transition"
                  onClick={agregarPaso}
                  type="button"
                >
                  <span className="material-symbols-outlined text-base">add_circle</span>
                  <span>Añadir Paso</span>
                </button>
              </div>

              <div className="space-y-3">
                {pasos.map((paso, index) => (
                  <div className="flex items-start gap-2.5" key={paso.id}>
                    <span className="font-bold text-xs text-[#154212] bg-[#bcf0ae]/40 w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-2">
                      {index + 1}
                    </span>
                    <textarea
                      className="flex-1 bg-[#fbf9f8] border border-[#c2c9bb] rounded-xl px-3 py-2 text-xs text-[#1b1c1c] focus:outline-hidden focus:ring-1 focus:ring-[#154212]"
                      placeholder={`Describe el paso ${index + 1}...`}
                      rows={2}
                      value={paso.texto}
                      onChange={(event) => actualizarPaso(paso.id, event.target.value)}
                      required
                    />
                    {pasos.length > 1 && (
                      <button
                        className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition mt-1"
                        onClick={() => eliminarPaso(paso.id)}
                        type="button"
                        title="Eliminar paso"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Barra fija inferior con Guardar / Cancelar */}
            <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-[#c2c9bb]/40 px-6 py-3.5 flex items-center justify-between z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
              <div className="flex-1 mr-4 min-w-0">
                {error ? (
                  <p className="text-xs text-red-700 truncate font-medium">{error}</p>
                ) : (
                  <p className="text-xs text-[#72796e] hidden sm:block">Todos los campos con (*) son obligatorios.</p>
                )}
              </div>
              <div className="flex space-x-3 shrink-0">
                <button
                  className="px-4 py-2 rounded-xl border border-[#c2c9bb] text-[#42493e] text-xs font-bold hover:bg-[#f6f3f2] transition-all"
                  onClick={props.onClose}
                  type="button"
                >
                  Cancelar
                </button>
                <button
                  className="px-6 py-2 rounded-xl bg-[#154212] text-white text-xs font-bold shadow-xs hover:bg-[#2d5a27] active:scale-95 transition-all disabled:opacity-60 flex items-center gap-1.5"
                  disabled={isSaving}
                  type="submit"
                >
                  {isSaving && <span className="material-symbols-outlined text-xs animate-spin">progress_activity</span>}
                  <span>{isSaving ? 'Guardando...' : (recipe ? 'Guardar Cambios' : 'Guardar Receta')}</span>
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>

      {/* Navegación inferior móvil */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)] border-t border-[#e4e2e1]">
        <button
          className="flex flex-col items-center justify-center text-[#605e5b]"
          onClick={props.onClose}
          type="button"
        >
          <span className="material-symbols-outlined text-xl">menu_book</span>
          <span className="text-[10px]">Recetas</span>
        </button>
        <button
          className="flex flex-col items-center justify-center text-[#605e5b]"
          onClick={props.onNavigateDiscover}
          type="button"
        >
          <span className="material-symbols-outlined text-xl">explore</span>
          <span className="text-[10px]">Descubrir</span>
        </button>
        <button
          className="flex flex-col items-center justify-center text-[#605e5b]"
          onClick={props.onNavigateCategories ?? props.onClose}
          type="button"
        >
          <span className="material-symbols-outlined text-xl">grid_view</span>
          <span className="text-[10px]">Categorías</span>
        </button>
        <button
          className="flex flex-col items-center justify-center text-[#605e5b]"
          onClick={props.onNavigatePantry ?? props.onClose}
          type="button"
        >
          <span className="material-symbols-outlined text-xl">kitchen</span>
          <span className="text-[10px]">Despensa</span>
        </button>
      </nav>
    </div>
  );
}
