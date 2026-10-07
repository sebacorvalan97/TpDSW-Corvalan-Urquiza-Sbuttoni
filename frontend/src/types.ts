// Categoría que agrupa recetas, por ejemplo pastas o postres.
export interface Categoria { id: string; nombre: string; }

// Procedencia geográfica asociada a un plato.
export interface Origen { id: string; pais: string; bandera: string; }

// Nivel de complejidad requerido para preparar una receta.
export interface Dificultad { id: string; nivel: string; }

// Ingrediente del catálogo; cantidad y unidad pueden variar en cada receta que lo usa.
export interface Ingrediente { id: string; nombre: string; unidadMedidaDefecto: string; cantidad?: number; unidad?: string; sustitutos?: Sustituto[]; }

// Alternativa que puede usarse en lugar de un ingrediente principal.
export interface Sustituto { id: string; ingredientePrincipalId: string; nombreSustituto: string; proporcion: string; notas: string; }

// Datos descriptivos del plato vinculados a categoría, origen y dificultad.
export interface Plato { id: string; nombre: string; descripcion: string; imagenUrl: string; categoriaId: string; origenId: string; dificultadId: string; }

// Receta completa: plato, tiempos, porciones, ingredientes, instrucciones y valoración.
export interface Receta { id: string; platoId: string; plato: Plato; tiempoPreparacionMin: number; tiempoCoccionMin: number; porcionesBase: number; ingredientes: Ingrediente[]; pasos: string[]; calificacionPromedio: number; totalCalificaciones: number; creadorUsuarioId: string; creadorNombre: string; esFavorito: boolean; }

// Perfil de una persona usuaria de la aplicación.
export interface Usuario { id: string; nombre: string; avatar: string; }

// Comentario y calificación de una persona sobre una receta.
export interface Comentario { id: string; recetaId: string; usuarioId: string; nombreUsuario: string; avatarUsuario: string; calificacion: number; texto: string; fecha: string; likes: number; }
