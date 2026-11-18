import { prisma } from './prisma.js';
import { INITIAL_SEED_DATA } from './seed-data.js';

const SCHEMA_STATEMENTS: readonly string[] = [
  `CREATE TABLE IF NOT EXISTS \`cuenta\` (
    \`idCuenta\` INTEGER NOT NULL AUTO_INCREMENT,
    \`fechaAlta\` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    \`contrasenia\` VARCHAR(255) NOT NULL,
    \`estado\` VARCHAR(50) NOT NULL DEFAULT 'activo',
    \`mail\` VARCHAR(255) NOT NULL,
    UNIQUE INDEX \`cuenta_mail_key\`(\`mail\`),
    PRIMARY KEY (\`idCuenta\`)
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

  `CREATE TABLE IF NOT EXISTS \`usuario\` (
    \`idCuenta\` INTEGER NOT NULL,
    \`nombre\` VARCHAR(100) NOT NULL,
    \`apellido\` VARCHAR(100) NOT NULL,
    \`fechaNacimiento\` DATE NULL,
    \`biografia\` TEXT NULL,
    \`fotoPerfil\` VARCHAR(500) NULL,
    PRIMARY KEY (\`idCuenta\`),
    CONSTRAINT \`usuario_idCuenta_fkey\` FOREIGN KEY (\`idCuenta\`) REFERENCES \`cuenta\`(\`idCuenta\`) ON DELETE CASCADE ON UPDATE CASCADE
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

  `CREATE TABLE IF NOT EXISTS \`administrador\` (
    \`idAdministrador\` INTEGER NOT NULL AUTO_INCREMENT,
    \`idCuenta\` INTEGER NOT NULL,
    \`nombre\` VARCHAR(100) NOT NULL,
    \`nivelAcceso\` VARCHAR(50) NOT NULL DEFAULT 'basico',
    \`fechaDesignacion\` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    UNIQUE INDEX \`administrador_idCuenta_key\`(\`idCuenta\`),
    PRIMARY KEY (\`idAdministrador\`),
    CONSTRAINT \`administrador_idCuenta_fkey\` FOREIGN KEY (\`idCuenta\`) REFERENCES \`cuenta\`(\`idCuenta\`) ON DELETE CASCADE ON UPDATE CASCADE
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

  `CREATE TABLE IF NOT EXISTS \`categoria\` (
    \`idCategoria\` INTEGER NOT NULL AUTO_INCREMENT,
    \`nombreCategoria\` VARCHAR(100) NOT NULL,
    \`descripcion\` VARCHAR(200) NOT NULL DEFAULT '',
    UNIQUE INDEX \`categoria_nombreCategoria_key\`(\`nombreCategoria\`),
    PRIMARY KEY (\`idCategoria\`)
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

  `CREATE TABLE IF NOT EXISTS \`dificultad\` (
    \`idDificultad\` INTEGER NOT NULL AUTO_INCREMENT,
    \`nivel\` VARCHAR(50) NOT NULL,
    UNIQUE INDEX \`dificultad_nivel_key\`(\`nivel\`),
    PRIMARY KEY (\`idDificultad\`)
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

  `CREATE TABLE IF NOT EXISTS \`origen\` (
    \`idOrigen\` INTEGER NOT NULL AUTO_INCREMENT,
    \`nombreOrigen\` VARCHAR(150) NOT NULL,
    \`paisReferencia\` VARCHAR(100) NOT NULL,
    \`region\` VARCHAR(100) NULL,
    \`descripcionCultura\` TEXT NULL,
    PRIMARY KEY (\`idOrigen\`)
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

  `CREATE TABLE IF NOT EXISTS \`ingrediente\` (
    \`idIngrediente\` INTEGER NOT NULL AUTO_INCREMENT,
    \`nombreIngrediente\` VARCHAR(150) NOT NULL,
    \`descripcion\` VARCHAR(200) NOT NULL DEFAULT '',
    \`unidadMedidaDefecto\` VARCHAR(50) NOT NULL DEFAULT 'unidad',
    UNIQUE INDEX \`ingrediente_nombreIngrediente_key\`(\`nombreIngrediente\`),
    PRIMARY KEY (\`idIngrediente\`)
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

  `CREATE TABLE IF NOT EXISTS \`ingrediente_sustituto\` (
    \`idSustituto\` INTEGER NOT NULL,
    \`idIngrediente\` INTEGER NOT NULL,
    \`proporcionConversion\` VARCHAR(100) NOT NULL,
    \`notas\` VARCHAR(200) NOT NULL DEFAULT '',
    INDEX \`fk_original_ingrediente\`(\`idIngrediente\`),
    PRIMARY KEY (\`idSustituto\`, \`idIngrediente\`),
    CONSTRAINT \`ingrediente_sustituto_idSustituto_fkey\` FOREIGN KEY (\`idSustituto\`) REFERENCES \`ingrediente\`(\`idIngrediente\`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT \`ingrediente_sustituto_idIngrediente_fkey\` FOREIGN KEY (\`idIngrediente\`) REFERENCES \`ingrediente\`(\`idIngrediente\`) ON DELETE CASCADE ON UPDATE CASCADE
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

  `CREATE TABLE IF NOT EXISTS \`plato\` (
    \`idPlato\` INTEGER NOT NULL AUTO_INCREMENT,
    \`nombre\` VARCHAR(200) NOT NULL,
    \`descripcionReceta\` TEXT NULL,
    \`imagenUrl\` VARCHAR(500) NULL,
    PRIMARY KEY (\`idPlato\`)
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

  `CREATE TABLE IF NOT EXISTS \`plato_origen\` (
    \`idPlato\` INTEGER NOT NULL,
    \`idOrigen\` INTEGER NOT NULL,
    INDEX \`fk_plato_origen_origen\`(\`idOrigen\`),
    PRIMARY KEY (\`idPlato\`, \`idOrigen\`),
    CONSTRAINT \`plato_origen_idPlato_fkey\` FOREIGN KEY (\`idPlato\`) REFERENCES \`plato\`(\`idPlato\`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT \`plato_origen_idOrigen_fkey\` FOREIGN KEY (\`idOrigen\`) REFERENCES \`origen\`(\`idOrigen\`) ON DELETE CASCADE ON UPDATE CASCADE
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

  `CREATE TABLE IF NOT EXISTS \`receta\` (
    \`idReceta\` INTEGER NOT NULL AUTO_INCREMENT,
    \`idPlato\` INTEGER NOT NULL,
    \`descripcionReceta\` TEXT NULL,
    \`duracion\` VARCHAR(50) NULL,
    \`idCategoria\` INTEGER NULL,
    \`idDificultad\` INTEGER NULL,
    \`idCuentaCreador\` INTEGER NULL,
    UNIQUE INDEX \`receta_idPlato_key\`(\`idPlato\`),
    INDEX \`idx_receta_categoria\`(\`idCategoria\`),
    INDEX \`idx_receta_dificultad\`(\`idDificultad\`),
    INDEX \`idx_receta_creador\`(\`idCuentaCreador\`),
    PRIMARY KEY (\`idReceta\`),
    CONSTRAINT \`receta_idPlato_fkey\` FOREIGN KEY (\`idPlato\`) REFERENCES \`plato\`(\`idPlato\`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT \`receta_idCategoria_fkey\` FOREIGN KEY (\`idCategoria\`) REFERENCES \`categoria\`(\`idCategoria\`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT \`receta_idDificultad_fkey\` FOREIGN KEY (\`idDificultad\`) REFERENCES \`dificultad\`(\`idDificultad\`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT \`receta_idCuentaCreador_fkey\` FOREIGN KEY (\`idCuentaCreador\`) REFERENCES \`usuario\`(\`idCuenta\`) ON DELETE SET NULL ON UPDATE CASCADE
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

  `CREATE TABLE IF NOT EXISTS \`paso_receta\` (
    \`idPaso\` INTEGER NOT NULL AUTO_INCREMENT,
    \`idReceta\` INTEGER NOT NULL,
    \`numeroOrden\` INTEGER NOT NULL,
    \`descripcionPaso\` TEXT NOT NULL,
    INDEX \`idx_paso_receta\`(\`idReceta\`),
    UNIQUE INDEX \`uq_paso_orden\`(\`idReceta\`, \`numeroOrden\`),
    PRIMARY KEY (\`idPaso\`),
    CONSTRAINT \`paso_receta_idReceta_fkey\` FOREIGN KEY (\`idReceta\`) REFERENCES \`receta\`(\`idReceta\`) ON DELETE CASCADE ON UPDATE CASCADE
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

  `CREATE TABLE IF NOT EXISTS \`item_receta\` (
    \`idItemReceta\` INTEGER NOT NULL AUTO_INCREMENT,
    \`idReceta\` INTEGER NOT NULL,
    \`idIngrediente\` INTEGER NOT NULL,
    \`cantidadIngrediente\` DECIMAL(10, 2) NOT NULL,
    \`unidadMedida\` VARCHAR(50) NOT NULL,
    INDEX \`fk_item_receta_ingrediente\`(\`idIngrediente\`),
    INDEX \`idx_item_receta_receta\`(\`idReceta\`),
    UNIQUE INDEX \`uq_receta_ingrediente\`(\`idReceta\`, \`idIngrediente\`),
    PRIMARY KEY (\`idItemReceta\`),
    CONSTRAINT \`item_receta_idReceta_fkey\` FOREIGN KEY (\`idReceta\`) REFERENCES \`receta\`(\`idReceta\`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT \`item_receta_idIngrediente_fkey\` FOREIGN KEY (\`idIngrediente\`) REFERENCES \`ingrediente\`(\`idIngrediente\`) ON DELETE CASCADE ON UPDATE CASCADE
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

  `CREATE TABLE IF NOT EXISTS \`comentario\` (
    \`idComentario\` INTEGER NOT NULL AUTO_INCREMENT,
    \`idCuenta\` INTEGER NOT NULL,
    \`idPlato\` INTEGER NOT NULL,
    \`descripcionComentario\` TEXT NOT NULL,
    \`calificacion\` INTEGER NOT NULL,
    \`fechaComentario\` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    INDEX \`idx_comentario_plato\`(\`idPlato\`),
    INDEX \`idx_comentario_usuario\`(\`idCuenta\`),
    PRIMARY KEY (\`idComentario\`),
    CONSTRAINT \`comentario_idCuenta_fkey\` FOREIGN KEY (\`idCuenta\`) REFERENCES \`usuario\`(\`idCuenta\`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT \`comentario_idPlato_fkey\` FOREIGN KEY (\`idPlato\`) REFERENCES \`plato\`(\`idPlato\`) ON DELETE CASCADE ON UPDATE CASCADE
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

  `CREATE TABLE IF NOT EXISTS \`comentario_like\` (
    \`idCuenta\` INTEGER NOT NULL,
    \`idComentario\` INTEGER NOT NULL,
    INDEX \`idx_comentario_like_comentario\`(\`idComentario\`),
    PRIMARY KEY (\`idCuenta\`, \`idComentario\`),
    CONSTRAINT \`comentario_like_idCuenta_fkey\` FOREIGN KEY (\`idCuenta\`) REFERENCES \`usuario\`(\`idCuenta\`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT \`comentario_like_idComentario_fkey\` FOREIGN KEY (\`idComentario\`) REFERENCES \`comentario\`(\`idComentario\`) ON DELETE CASCADE ON UPDATE CASCADE
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

  `CREATE TABLE IF NOT EXISTS \`favorito\` (
    \`idCuenta\` INTEGER NOT NULL,
    \`idReceta\` INTEGER NOT NULL,
    \`fechaAlta\` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    INDEX \`idx_favorito_receta\`(\`idReceta\`),
    PRIMARY KEY (\`idCuenta\`, \`idReceta\`),
    CONSTRAINT \`favorito_idCuenta_fkey\` FOREIGN KEY (\`idCuenta\`) REFERENCES \`usuario\`(\`idCuenta\`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT \`favorito_idReceta_fkey\` FOREIGN KEY (\`idReceta\`) REFERENCES \`receta\`(\`idReceta\`) ON DELETE CASCADE ON UPDATE CASCADE
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

  `CREATE TABLE IF NOT EXISTS \`item_alacena\` (
    \`idCuenta\` INTEGER NOT NULL,
    \`idIngrediente\` INTEGER NOT NULL,
    \`cantidadIngrediente\` DECIMAL(10, 2) NOT NULL,
    \`unidadMedida\` VARCHAR(50) NOT NULL,
    INDEX \`fk_alacena_ingrediente\`(\`idIngrediente\`),
    PRIMARY KEY (\`idCuenta\`, \`idIngrediente\`),
    CONSTRAINT \`item_alacena_idCuenta_fkey\` FOREIGN KEY (\`idCuenta\`) REFERENCES \`usuario\`(\`idCuenta\`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT \`item_alacena_idIngrediente_fkey\` FOREIGN KEY (\`idIngrediente\`) REFERENCES \`ingrediente\`(\`idIngrediente\`) ON DELETE CASCADE ON UPDATE CASCADE
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
];

export async function ensureDatabaseReady(): Promise<void> {
  for (const sql of SCHEMA_STATEMENTS) {
    await prisma.$executeRawUnsafe(sql);
  }

  const recipeCount = await prisma.receta.count();
  if (recipeCount > 0) {
    return;
  }

  console.log('Base de datos vacía detectada. Inicializando datos del catálogo y recetas...');

  await prisma.cuenta.createMany({
    data: INITIAL_SEED_DATA.cuentas.map((c) => ({
      ...c,
      fechaAlta: new Date(c.fechaAlta),
    })),
    skipDuplicates: true,
  });

  await prisma.usuario.createMany({
    data: INITIAL_SEED_DATA.usuarios.map((u) => ({
      ...u,
      fechaNacimiento: u.fechaNacimiento ? new Date(u.fechaNacimiento) : null,
    })),
    skipDuplicates: true,
  });

  await prisma.administrador.createMany({
    data: INITIAL_SEED_DATA.administradores.map((a) => ({
      ...a,
      fechaDesignacion: new Date(a.fechaDesignacion),
    })),
    skipDuplicates: true,
  });

  await prisma.categoria.createMany({
    data: [...INITIAL_SEED_DATA.categorias],
    skipDuplicates: true,
  });

  await prisma.dificultad.createMany({
    data: [...INITIAL_SEED_DATA.dificultades],
    skipDuplicates: true,
  });

  await prisma.origen.createMany({
    data: [...INITIAL_SEED_DATA.origenes],
    skipDuplicates: true,
  });

  await prisma.ingrediente.createMany({
    data: [...INITIAL_SEED_DATA.ingredientes],
    skipDuplicates: true,
  });

  await prisma.ingredienteSustituto.createMany({
    data: [...INITIAL_SEED_DATA.sustitutos],
    skipDuplicates: true,
  });

  await prisma.plato.createMany({
    data: [...INITIAL_SEED_DATA.platos],
    skipDuplicates: true,
  });

  await prisma.platoOrigen.createMany({
    data: [...INITIAL_SEED_DATA.platosOrigenes],
    skipDuplicates: true,
  });

  await prisma.receta.createMany({
    data: [...INITIAL_SEED_DATA.recetas],
    skipDuplicates: true,
  });

  await prisma.pasoReceta.createMany({
    data: [...INITIAL_SEED_DATA.pasosReceta],
    skipDuplicates: true,
  });

  await prisma.itemReceta.createMany({
    data: [...INITIAL_SEED_DATA.itemsReceta],
    skipDuplicates: true,
  });

  await prisma.comentario.createMany({
    data: INITIAL_SEED_DATA.comentarios.map((c) => ({
      ...c,
      fechaComentario: new Date(c.fechaComentario),
    })),
    skipDuplicates: true,
  });

  if (INITIAL_SEED_DATA.comentarioLikes.length > 0) {
    await prisma.comentarioLike.createMany({
      data: [...INITIAL_SEED_DATA.comentarioLikes],
      skipDuplicates: true,
    });
  }

  if (INITIAL_SEED_DATA.favoritos.length > 0) {
    await prisma.favorito.createMany({
      data: INITIAL_SEED_DATA.favoritos.map((f) => ({
        ...f,
        fechaAlta: new Date(f.fechaAlta),
      })),
      skipDuplicates: true,
    });
  }

  if (INITIAL_SEED_DATA.itemsAlacena.length > 0) {
    await prisma.itemAlacena.createMany({
      data: [...INITIAL_SEED_DATA.itemsAlacena],
      skipDuplicates: true,
    });
  }

  console.log('Seed inicial cargado con éxito.');
}
