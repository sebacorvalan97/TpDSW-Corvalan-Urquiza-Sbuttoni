export interface Categoria { id: string; nombre: string; }
export interface Origen { id: string; pais: string; bandera: string; }
export interface Dificultad { id: string; nivel: string; }
export interface Ingrediente { id: string; nombre: string; unidadMedidaDefecto: string; sustitutos?: Sustituto[]; }
export interface Sustituto { id: string; ingredientePrincipalId: string; nombreSustituto: string; proporcion: string; notas: string; }
export interface Plato { id: string; nombre: string; descripcion: string; imagenUrl: string; categoriaId: string; origenId: string; dificultadId: string; }
export interface Receta { id: string; platoId: string; plato: Plato; tiempoPreparacionMin: number; tiempoCoccionMin: number; porcionesBase: number; ingredientes: Ingrediente[]; pasos: string[]; calificacionPromedio: number; totalCalificaciones: number; creadorUsuarioId: string; creadorNombre: string; esFavorito: boolean; }
export interface Usuario { id: string; nombre: string; avatar: string; }
export interface Comentario { id: string; recetaId: string; usuarioId: string; nombreUsuario: string; avatarUsuario: string; calificacion: number; texto: string; fecha: string; likes: number; }
