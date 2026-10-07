import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Categoria, Dificultad, Ingrediente, Origen, Receta, Usuario } from '../types';

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
  onSaveRecipe: (recipeData: Partial<Receta>) => void;
  onCreateIngredient: (nombre: string, unidad: string) => Ingrediente;
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

  // Estado de los campos generales; se inicializa con los datos de la receta en modo edición.
  const [nombre, setNombre] = useState(recipe?.plato.nombre ?? '');
  const [descripcion, setDescripcion] = useState(recipe?.plato.descripcion ?? '');
  const [categoriaId, setCategoriaId] = useState(recipe?.plato.categoriaId ?? '');
  const [origenId, setOrigenId] = useState(recipe?.plato.origenId ?? '');
  const [dificultadId, setDificultadId] = useState(recipe?.plato.dificultadId ?? '');
  const [imagenUrl, setImagenUrl] = useState(recipe?.plato.imagenUrl ?? '');

  // Estado de las listas dinámicas de ingredientes y pasos, con una fila vacía al crear.
  const [ingredientes, setIngredientes] = useState<IngredienteDraft[]>(
    recipe?.ingredientes.length
      ? recipe.ingredientes.map((ingrediente) => ({
          id: createId(),
          nombre: ingrediente.nombre,
          cantidad: ingrediente.cantidad?.toString() ?? '',
          unidad: ingrediente.unidad ?? ingrediente.unidadMedidaDefecto,
        }))
      : [{ id: createId(), nombre: '', cantidad: '', unidad: '' }]
  );
  const [pasos, setPasos] = useState<PasoDraft[]>(
    recipe?.pasos.length
      ? recipe.pasos.map((texto) => ({ id: createId(), texto }))
      : [{ id: createId(), texto: '' }]
  );
  const [error, setError] = useState('');

  // Agrega una fila vacía de ingrediente sin manipular directamente el DOM.
  function agregarIngrediente() {
    setIngredientes((actuales) => [
      ...actuales,
      { id: createId(), nombre: '', cantidad: '', unidad: '' },
    ]);
  }

  // Actualiza solo el campo editado en la fila del ingrediente indicado.
  function actualizarIngrediente(id: string, cambios: Partial<IngredienteDraft>) {
    setIngredientes((actuales) =>
      actuales.map((ingrediente) =>
        ingrediente.id === id ? { ...ingrediente, ...cambios } : ingrediente
      )
    );
  }

  // Agrega una instrucción vacía; su número se calcula al renderizar la lista.
  function agregarPaso() {
    setPasos((actuales) => [...actuales, { id: createId(), texto: '' }]);
  }

  // Guarda el texto de una instrucción en el estado asociado a su identificador.
  function actualizarPaso(id: string, texto: string) {
    setPasos((actuales) =>
      actuales.map((paso) => (paso.id === id ? { ...paso, texto } : paso))
    );
  }

  // Valida el formulario, obtiene o crea ingredientes del catálogo y entrega la receta a App.
  function guardarReceta(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const ingredientesCompletos = ingredientes.filter(
      (ingrediente) => ingrediente.nombre.trim()
    );
    const pasosCompletos = pasos
      .map((paso) => paso.texto.trim())
      .filter(Boolean);

    // Evita guardar una receta que no tenga por lo menos un ingrediente y una instrucción.
    if (!ingredientesCompletos.length || !pasosCompletos.length) {
      setError('Agrega al menos un ingrediente y un paso de preparación.');
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
    const ingredientesGuardados = ingredientesCompletos.map((ingrediente) => {
      const unidad = ingrediente.unidad.trim() || 'unidad';
      const existente = props.ingredientesCatalogo.find(
        (item) => item.nombre.toLowerCase() === ingrediente.nombre.trim().toLowerCase()
      );
      const catalogo = existente
        ?? props.onCreateIngredient(ingrediente.nombre.trim(), unidad);

      return {
        ...catalogo,
        cantidad: ingrediente.cantidad.trim() ? Number(ingrediente.cantidad) : undefined,
        unidad,
      };
    });

    // Empaqueta los campos del plato y la receta para que App cree o actualice el registro.
    const platoId = recipe?.plato.id ?? `plt-${Date.now()}`;
    props.onSaveRecipe({
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
      ingredientes: ingredientesGuardados,
      pasos: pasosCompletos,
    });
  }

  return (
    <div>
      {/* Cabecera del asistente: identidad de la aplicación y navegación hacia Descubrir. */}
<nav className="bg-surface-bright dark:bg-surface-dim shadow-sm docked full-width top-0 z-50 fixed w-full border-none">
<div className="flex justify-between items-center w-full px-margin-desktop py-md max-w-7xl mx-auto z-50">
<div className="font-display-lg text-display-lg text-primary dark:text-primary-fixed-dim">El Bodegón Digital</div>
<div className="hidden md:flex space-x-8 items-center">
<a className="text-secondary dark:text-secondary-fixed-dim font-medium pb-1 hover:text-primary-container transition-colors duration-200" href="#">Mis Recetas</a>
<button className="text-secondary dark:text-secondary-fixed-dim font-medium pb-1 hover:text-primary-container transition-colors duration-200" onClick={props.onNavigateDiscover} type="button">Descubrir</button>
<a className="text-secondary dark:text-secondary-fixed-dim font-medium pb-1 hover:text-primary-container transition-colors duration-200" href="#">Categorías</a>
<a className="text-secondary dark:text-secondary-fixed-dim font-medium pb-1 hover:text-primary-container transition-colors duration-200" href="#">Mi Despensa</a>
</div>
<div className="flex items-center space-x-4">
<div className="relative hidden sm:block">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
<input className="bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 text-body-md focus:ring-1 focus:ring-primary w-64" placeholder="Buscar ingredientes..." type="text"/>
</div>
<img className="w-10 h-10 rounded-full border-2 border-primary object-cover" data-alt="A professional chef avatar profile photo in a soft-lit, minimalist kitchen setting. The image is clean and bright, reflecting a high-end culinary professional aesthetic with warm neutral tones and subtle wood textures in the background." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsQOeayrcUgM9iHTQm5F8OfCM7KkUPk8j0A0lELVxxEPCgkK-a1nbpaTDauovqzKMX312Qyk-O_EuvttVqF3Mut9IfW_AAniuU99nA_rrG_tCYtVgvWdAON59A2aTcxA8zs9L1pii4FSlYNnDCdvjShxLa9-hvUbVGEEioidG4lXCFHsIWNy8rRYjGuiA7nG55x-JBlBKDacD4KIp8nrF5_HCqyy1rJeS9N1xjlS-80ZItT2Xz2eh9"/>
</div>
</div>
</nav>
{/* Contenedor de la pantalla: separa el menú lateral del formulario principal. */}
<div className="flex pt-32 pb-24 lg:pt-24 lg:pb-0">
{/* Menú lateral de escritorio con el perfil y los accesos de navegación. */}
<aside className="hidden lg:flex flex-col h-full py-lg px-md space-y-base bg-surface-container-low dark:bg-surface-container-high border-r border-outline-variant h-full w-64 left-0 fixed">
<div className="px-2 pb-6">
<div className="font-headline-md text-headline-md text-primary dark:text-primary-fixed-dim">Mi Cocina</div>
<div className="text-label-md text-on-surface-variant">Chef Maestro</div>
</div>
<nav className="flex-1 space-y-2">
<a className="flex items-center space-x-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-highest transition-colors rounded-lg" href="#">
<span className="material-symbols-outlined">book</span>
<span className="font-label-md">Mis Recetas</span>
</a>
<button className="flex items-center space-x-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-highest transition-colors rounded-lg" onClick={props.onNavigateDiscover} type="button">
<span className="material-symbols-outlined">explore</span>
<span className="font-label-md">Descubrir</span>
</button>
<a className="flex items-center space-x-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-highest transition-colors rounded-lg" href="#">
<span className="material-symbols-outlined">category</span>
<span className="font-label-md">Categorías</span>
</a>
<a className="flex items-center space-x-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-highest transition-colors rounded-lg" href="#">
<span className="material-symbols-outlined">kitchen</span>
<span className="font-label-md">Mi Despensa</span>
</a>
</nav>
<div className="pt-6 border-t border-outline-variant space-y-2">
<a className="flex items-center space-x-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-highest transition-colors rounded-lg" href="#">
<span className="material-symbols-outlined">settings</span>
<span className="font-label-md">Ajustes</span>
</a>
<a className="flex items-center space-x-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-highest transition-colors rounded-lg" href="#">
<span className="material-symbols-outlined">help</span>
<span className="font-label-md">Soporte</span>
</a>
</div>
</aside>
{/* Área central que presenta el encabezado y el formulario de la receta. */}
<main className="flex-1 lg:ml-64 px-4 md:px-gutter max-w-5xl mx-auto w-full">
{/* Título y descripción para indicar el propósito del formulario. */}
<div className="mb-10">
<h1 className="font-display-lg text-display-lg text-primary mb-2">Crear Nueva Receta</h1>
<p className="text-body-lg text-secondary">Documenta tu obra maestra culinaria con precisión y calidez.</p>
</div>
{/* Módulo: formulario dividido en secciones; su envío ejecuta las validaciones y el guardado. */}
<form className="space-y-12 pb-32" id="recipeForm" onSubmit={guardarReceta}>
{/* Sección 1: nombre, descripción, categoría, origen, dificultad e imagen de portada. */}
<section className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-surface-variant/20">
<div className="flex items-center space-x-4 mb-8">
<div className="bg-primary text-on-primary w-10 h-10 rounded-full flex items-center justify-center font-bold">1</div>
<h2 className="font-headline-md text-headline-md text-primary">Detalles Esenciales</h2>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
{/* Campos generales del plato y selector visual del nivel de dificultad. */}
<div className="space-y-6">
<div className="group">
<label className="block text-label-md text-primary mb-2">Nombre de la Receta</label>
<input className="w-full bg-white border border-outline-variant rounded-lg px-4 py-3 font-body-md focus:border-primary transition-all" placeholder="ej. Costillas Estofadas de la Abuela" type="text" value={nombre} onChange={(event) => setNombre(event.target.value)} required/>
</div>
<div>
<label className="block text-label-md text-primary mb-2">Descripción</label>
<textarea className="w-full bg-white border border-outline-variant rounded-lg px-4 py-3 font-body-md focus:border-primary transition-all" placeholder="Describe brevemente el alma de este plato..." rows={4} value={descripcion} onChange={(event) => setDescripcion(event.target.value)} required></textarea>
</div>
<div className="grid grid-cols-2 gap-4">
<div>
<label className="block text-label-md text-primary mb-2">Categoría</label>
<select className="w-full bg-white border border-outline-variant rounded-lg px-4 py-3 font-body-md" value={categoriaId} onChange={(event) => setCategoriaId(event.target.value)} required>
<option value="">Seleccionar categoría</option>
{props.categorias.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>)}
</select>
</div>
<div>
<label className="block text-label-md text-primary mb-2">Origen / Región</label>
<select className="w-full bg-white border border-outline-variant rounded-lg px-4 py-3 font-body-md" value={origenId} onChange={(event) => setOrigenId(event.target.value)} required>
<option value="">Seleccionar origen</option>
{props.origenes.map((origen) => <option key={origen.id} value={origen.id}>{origen.pais}</option>)}
</select>
</div>
</div>
<div>
<label className="block text-label-md text-primary mb-2">Dificultad</label>
<div className="flex space-x-2">
{props.dificultades.map((dificultad) => (
  <button
    className={`flex-1 py-2 rounded-lg border border-outline-variant hover:bg-surface-container font-label-md transition-colors ${dificultadId === dificultad.id ? 'bg-primary-container text-on-primary-container border-primary' : ''}`}
    key={dificultad.id}
    onClick={() => setDificultadId(dificultad.id)}
    type="button"
  >
    {dificultad.nivel}
  </button>
))}
</div>
</div>
</div>
{/* Campo para ingresar la URL de la imagen que se usará como portada. */}
<div className="flex flex-col h-full">
<label className="block text-label-md text-primary mb-2">Foto de Portada</label>
<div className="flex-1 min-h-[300px] border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center bg-surface-container-low hover:bg-surface-container transition-all group p-6 text-center">
<span className="material-symbols-outlined text-4xl text-outline mb-4 group-hover:scale-110 transition-transform">add_a_photo</span>
<p className="font-label-md text-primary">URL de la foto de portada</p>
<input className="mt-3 w-full bg-white border border-outline-variant rounded-lg px-4 py-3 font-body-md" placeholder="https://..." type="url" value={imagenUrl} onChange={(event) => setImagenUrl(event.target.value)}/>
</div>
</div>
</div>
</section>
{/* Sección 2: ingredientes editables; cada fila guarda nombre, cantidad y unidad en estado React. */}
<section className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-surface-variant/20">
<div className="flex items-center justify-between mb-8">
<div className="flex items-center space-x-4">
<div className="bg-primary text-on-primary w-10 h-10 rounded-full flex items-center justify-center font-bold">2</div>
<h2 className="font-headline-md text-headline-md text-primary">Ingredientes</h2>
</div>
<button className="flex items-center space-x-2 text-primary font-label-md hover:opacity-80 transition-opacity" onClick={agregarIngrediente} type="button">
<span className="material-symbols-outlined">add_circle</span>
<span className="">Añadir Elemento</span>
</button>
</div>
<div className="space-y-4" id="ingredientsList">
{ingredientes.map((ingrediente) => (
<div className="flex items-center space-x-3 ingredient-row animate-in fade-in duration-300" key={ingrediente.id}>
<input className="flex-1 bg-white border border-outline-variant rounded-lg px-4 py-3 font-body-md" placeholder="Nombre del ingrediente" type="text" value={ingrediente.nombre} onChange={(event) => actualizarIngrediente(ingrediente.id, { nombre: event.target.value })}/>
<input className="w-24 bg-white border border-outline-variant rounded-lg px-4 py-3 font-body-md" min="0" placeholder="Cant." step="any" type="number" value={ingrediente.cantidad} onChange={(event) => actualizarIngrediente(ingrediente.id, { cantidad: event.target.value })}/>
<select className="w-32 bg-white border border-outline-variant rounded-lg px-4 py-3 font-body-md" value={ingrediente.unidad} onChange={(event) => actualizarIngrediente(ingrediente.id, { unidad: event.target.value })}>
<option value="">Unidad</option>
<option value="gramos">gramos</option>
<option value="ml">ml</option>
<option value="tazas">tazas</option>
<option value="cda">cda</option>
<option value="cdta">cdta</option>
<option value="unidad">unidad</option>
</select>
<button aria-label="Eliminar ingrediente" className="p-2 text-secondary hover:text-error transition-colors" onClick={() => setIngredientes((actuales) => actuales.filter((item) => item.id !== ingrediente.id))} type="button">
<span className="material-symbols-outlined">delete</span>
</button>
</div>
))}
</div>
</section>
{/* Sección 3: pasos editables; se numeran según el orden actual y pueden quitarse individualmente. */}
<section className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-surface-variant/20">
<div className="flex items-center justify-between mb-8">
<div className="flex items-center space-x-4">
<div className="bg-primary text-on-primary w-10 h-10 rounded-full flex items-center justify-center font-bold">3</div>
<h2 className="font-headline-md text-headline-md text-primary">Instrucciones</h2>
</div>
<button className="flex items-center space-x-2 text-primary font-label-md hover:opacity-80 transition-opacity" onClick={agregarPaso} type="button">
<span className="material-symbols-outlined">add_circle</span>
<span className="">Añadir Paso</span>
</button>
</div>
<div className="space-y-6" id="stepsList">
{pasos.map((paso, index) => (
<div className="flex space-x-4 step-row items-start group" key={paso.id}>
<div className="mt-4 flex flex-col items-center">
<div className="w-8 h-8 rounded-full border-2 border-outline-variant flex items-center justify-center text-label-sm text-secondary font-bold group-focus-within:border-primary group-focus-within:text-primary transition-colors">{index + 1}</div>
<div className="w-px h-full bg-outline-variant/30 mt-2"></div>
</div>
<div className="flex-1 bg-white border border-outline-variant rounded-xl p-4 transition-shadow focus-within:shadow-md">
<textarea className="w-full border-none p-0 resize-none font-body-md focus:ring-0" placeholder="Describe este paso..." rows={2} value={paso.texto} onChange={(event) => actualizarPaso(paso.id, event.target.value)}></textarea>
<div className="flex justify-end mt-2 pt-2 border-t border-outline-variant/10">
<button className="text-label-sm text-secondary flex items-center hover:text-error transition-colors" onClick={() => setPasos((actuales) => actuales.filter((item) => item.id !== paso.id))} type="button">
<span className="material-symbols-outlined text-sm mr-1">delete</span> Eliminar
                                    </button>
</div>
</div>
</div>
))}
</div>
</section>
{/* Acciones fijas del formulario: cancelar, mostrar validaciones y guardar los datos. */}
<div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-surface-container-lowest border-t border-outline-variant/30 px-margin-desktop py-6 flex items-center justify-between z-40">
<div className="hidden md:flex flex-col">
<p className="text-label-sm text-secondary">Borrador autoguardado hace 2 mins</p>
</div>
<div className="flex space-x-4 w-full md:w-auto">
<button className="flex-1 md:flex-none px-8 py-3 rounded-lg border border-primary text-primary font-bold hover:bg-surface-container-low transition-all" onClick={props.onClose} type="button">Cancelar</button>
<button className="flex-1 md:flex-none px-12 py-3 rounded-lg bg-primary text-on-primary font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all" type="submit">Guardar Receta</button>
</div>
</div>
{error && <p className="text-error text-sm" role="alert">{error}</p>}
</form>
</main>
</div>
{/* Navegación inferior móvil; sus accesos de sección están disponibles en pantallas pequeñas. */}
<nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe bg-surface-container-lowest dark:bg-surface-container shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-xl border-none">
<div className="flex flex-col items-center justify-center text-secondary dark:text-secondary-fixed-dim">
<span className="material-symbols-outlined">menu_book</span>
<span className="font-label-sm text-label-sm-mobile">Recetas</span>
</div>
<button className="flex flex-col items-center justify-center text-secondary dark:text-secondary-fixed-dim" onClick={props.onNavigateDiscover} type="button">
<span className="material-symbols-outlined">search</span>
<span className="font-label-sm text-label-sm-mobile">Descubrir</span>
</button>
<div className="flex flex-col items-center justify-center bg-primary-container dark:bg-primary text-on-primary-container dark:text-on-primary rounded-full px-4 py-1">
<span className="material-symbols-outlined">add</span>
<span className="font-label-sm text-label-sm-mobile">Crear</span>
</div>
<div className="flex flex-col items-center justify-center text-secondary dark:text-secondary-fixed-dim">
<span className="material-symbols-outlined">grid_view</span>
<span className="font-label-sm text-label-sm-mobile">Categorías</span>
</div>
<div className="flex flex-col items-center justify-center text-secondary dark:text-secondary-fixed-dim">
<span className="material-symbols-outlined">inventory_2</span>
<span className="font-label-sm text-label-sm-mobile">Despensa</span>
</div>
</nav>
    </div>
  );









}
