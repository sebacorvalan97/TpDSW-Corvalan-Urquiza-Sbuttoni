interface Categoria {
  id: string;
  nombre: string;
}

interface Origen {
  id: string;
  pais: string;
  bandera: string;
}

interface Dificultad {
  id: string;
  nivel: string;
}

interface Plato {
  idDish: number;
  name: string;
  description: string;
}

interface Ingrediente {
  id: string;
  nombre: string;
  unidadMedidaDefecto: string;
  sustitutos?: Sustituto[];
}

interface Sustituto {
  id: string;
  ingredientePrincipalId: string;
  nombreSustituto: string;
  proporcion: string;
  notas: string;
}

interface Receta {
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

interface Usuario {
  id: string;
  nombre: string;
  avatar: string;
}

interface Comentario {
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
