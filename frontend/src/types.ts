export interface Categoria {
  id: string;
  nombre: string;
}

interface Origen {
  id: string;
  pais: string;
  bandera: string;
}

export interface Dificultad {
  id: string;
  nivel: string;
}

export interface Plato {
  idDish: number;
  name: string;
  description: string;
}

export interface Ingrediente {
  id: string;
  nombre: string;
  unidadMedidaDefecto: string;
  sustitutos?: Sustituto[];
}

export interface Sustituto {
  id: string;
  ingredientePrincipalId: string;
  nombreSustituto: string;
  proporcion: string;
  notas: string;
}

export interface Receta {
  id: string;
  platoId: string;
  plato: Plato;
  tiempoPreparacionMin: number;
  tiempoCoccionMin: number;
  porcionesBase: number;
  ingredientes: Ingrediente[];
  pasos: string[];
  calificacionPromedio: number;
  totalCalificaciones: number;
  creadorUsuarioId: string;
  creadorNombre: string;
  esFavorito: boolean;
}

export interface Usuario {
  id: string;
  nombre: string;
  avatar: string;
}

export interface Comentario {
  id: string;
  recetaId: string;
  usuarioId: string;
  nombreUsuario: string;
  avatarUsuario: string;
  calificacion: number;
  texto: string;
  fecha: string;
  likes: number;
}

export interface PasoReceta {
  idPaso: number;
  recetaId: number;
  numeroOrden: number;
  descripcion: string;
}

export interface RecetaIngrediente {
  idRecetaIngrediente: number;
  recetaId: number;
  ingredienteId: number;
  cantidad: number;
  unidad: string;
}
