-- CreateTable
CREATE TABLE `cuenta` (
    `idCuenta` INTEGER NOT NULL AUTO_INCREMENT,
    `fechaAlta` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `contrasenia` VARCHAR(255) NOT NULL,
    `estado` VARCHAR(50) NOT NULL DEFAULT 'activo',
    `mail` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `cuenta_mail_key`(`mail`),
    PRIMARY KEY (`idCuenta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuario` (
    `idCuenta` INTEGER NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `apellido` VARCHAR(100) NOT NULL,
    `fechaNacimiento` DATE NULL,
    `biografia` TEXT NULL,
    `fotoPerfil` VARCHAR(500) NULL,

    PRIMARY KEY (`idCuenta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `administrador` (
    `idAdministrador` INTEGER NOT NULL AUTO_INCREMENT,
    `idCuenta` INTEGER NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `nivelAcceso` VARCHAR(50) NOT NULL DEFAULT 'basico',
    `fechaDesignacion` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `administrador_idCuenta_key`(`idCuenta`),
    PRIMARY KEY (`idAdministrador`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categoria` (
    `idCategoria` INTEGER NOT NULL AUTO_INCREMENT,
    `nombreCategoria` VARCHAR(100) NOT NULL,
    `descripcion` VARCHAR(200) NOT NULL DEFAULT '',

    UNIQUE INDEX `categoria_nombreCategoria_key`(`nombreCategoria`),
    PRIMARY KEY (`idCategoria`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dificultad` (
    `idDificultad` INTEGER NOT NULL AUTO_INCREMENT,
    `nivel` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `dificultad_nivel_key`(`nivel`),
    PRIMARY KEY (`idDificultad`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `origen` (
    `idOrigen` INTEGER NOT NULL AUTO_INCREMENT,
    `nombreOrigen` VARCHAR(150) NOT NULL,
    `paisReferencia` VARCHAR(100) NOT NULL,
    `region` VARCHAR(100) NULL,
    `descripcionCultura` TEXT NULL,

    PRIMARY KEY (`idOrigen`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ingrediente` (
    `idIngrediente` INTEGER NOT NULL AUTO_INCREMENT,
    `nombreIngrediente` VARCHAR(150) NOT NULL,
    `descripcion` VARCHAR(200) NOT NULL DEFAULT '',
    `unidadMedidaDefecto` VARCHAR(50) NOT NULL DEFAULT 'unidad',

    UNIQUE INDEX `ingrediente_nombreIngrediente_key`(`nombreIngrediente`),
    PRIMARY KEY (`idIngrediente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ingrediente_sustituto` (
    `idSustituto` INTEGER NOT NULL,
    `idIngrediente` INTEGER NOT NULL,
    `proporcionConversion` VARCHAR(100) NOT NULL,

    INDEX `fk_original_ingrediente`(`idIngrediente`),
    PRIMARY KEY (`idSustituto`, `idIngrediente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plato` (
    `idPlato` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(200) NOT NULL,
    `descripcionReceta` TEXT NULL,

    PRIMARY KEY (`idPlato`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plato_origen` (
    `idPlato` INTEGER NOT NULL,
    `idOrigen` INTEGER NOT NULL,

    INDEX `fk_plato_origen_origen`(`idOrigen`),
    PRIMARY KEY (`idPlato`, `idOrigen`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `receta` (
    `idReceta` INTEGER NOT NULL AUTO_INCREMENT,
    `idPlato` INTEGER NOT NULL,
    `descripcionReceta` TEXT NULL,
    `duracion` VARCHAR(50) NULL,
    `idCategoria` INTEGER NULL,
    `idDificultad` INTEGER NULL,
    `idCuentaCreador` INTEGER NULL,

    UNIQUE INDEX `receta_idPlato_key`(`idPlato`),
    INDEX `idx_receta_categoria`(`idCategoria`),
    INDEX `idx_receta_dificultad`(`idDificultad`),
    INDEX `idx_receta_creador`(`idCuentaCreador`),
    PRIMARY KEY (`idReceta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `paso_receta` (
    `idPaso` INTEGER NOT NULL AUTO_INCREMENT,
    `idReceta` INTEGER NOT NULL,
    `numeroOrden` INTEGER NOT NULL,
    `descripcionPaso` TEXT NOT NULL,

    INDEX `idx_paso_receta`(`idReceta`),
    UNIQUE INDEX `uq_paso_orden`(`idReceta`, `numeroOrden`),
    PRIMARY KEY (`idPaso`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `item_receta` (
    `idItemReceta` INTEGER NOT NULL AUTO_INCREMENT,
    `idReceta` INTEGER NOT NULL,
    `idIngrediente` INTEGER NOT NULL,
    `cantidadIngrediente` DECIMAL(10, 2) NOT NULL,
    `unidadMedida` VARCHAR(50) NOT NULL,

    INDEX `fk_item_receta_ingrediente`(`idIngrediente`),
    INDEX `idx_item_receta_receta`(`idReceta`),
    UNIQUE INDEX `uq_receta_ingrediente`(`idReceta`, `idIngrediente`),
    PRIMARY KEY (`idItemReceta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comentario` (
    `idComentario` INTEGER NOT NULL AUTO_INCREMENT,
    `idCuenta` INTEGER NOT NULL,
    `idPlato` INTEGER NOT NULL,
    `descripcionComentario` TEXT NOT NULL,
    `calificacion` INTEGER NOT NULL,
    `fechaComentario` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_comentario_plato`(`idPlato`),
    INDEX `idx_comentario_usuario`(`idCuenta`),
    PRIMARY KEY (`idComentario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `item_alacena` (
    `idCuenta` INTEGER NOT NULL,
    `idIngrediente` INTEGER NOT NULL,
    `cantidadIngrediente` DECIMAL(10, 2) NOT NULL,
    `unidadMedida` VARCHAR(50) NOT NULL,

    INDEX `fk_alacena_ingrediente`(`idIngrediente`),
    PRIMARY KEY (`idCuenta`, `idIngrediente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `usuario` ADD CONSTRAINT `usuario_idCuenta_fkey` FOREIGN KEY (`idCuenta`) REFERENCES `cuenta`(`idCuenta`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `administrador` ADD CONSTRAINT `administrador_idCuenta_fkey` FOREIGN KEY (`idCuenta`) REFERENCES `cuenta`(`idCuenta`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ingrediente_sustituto` ADD CONSTRAINT `ingrediente_sustituto_idSustituto_fkey` FOREIGN KEY (`idSustituto`) REFERENCES `ingrediente`(`idIngrediente`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ingrediente_sustituto` ADD CONSTRAINT `ingrediente_sustituto_idIngrediente_fkey` FOREIGN KEY (`idIngrediente`) REFERENCES `ingrediente`(`idIngrediente`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `plato_origen` ADD CONSTRAINT `plato_origen_idPlato_fkey` FOREIGN KEY (`idPlato`) REFERENCES `plato`(`idPlato`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `plato_origen` ADD CONSTRAINT `plato_origen_idOrigen_fkey` FOREIGN KEY (`idOrigen`) REFERENCES `origen`(`idOrigen`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `receta` ADD CONSTRAINT `receta_idPlato_fkey` FOREIGN KEY (`idPlato`) REFERENCES `plato`(`idPlato`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `receta` ADD CONSTRAINT `receta_idCategoria_fkey` FOREIGN KEY (`idCategoria`) REFERENCES `categoria`(`idCategoria`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `receta` ADD CONSTRAINT `receta_idDificultad_fkey` FOREIGN KEY (`idDificultad`) REFERENCES `dificultad`(`idDificultad`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `receta` ADD CONSTRAINT `receta_idCuentaCreador_fkey` FOREIGN KEY (`idCuentaCreador`) REFERENCES `usuario`(`idCuenta`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `paso_receta` ADD CONSTRAINT `paso_receta_idReceta_fkey` FOREIGN KEY (`idReceta`) REFERENCES `receta`(`idReceta`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `item_receta` ADD CONSTRAINT `item_receta_idReceta_fkey` FOREIGN KEY (`idReceta`) REFERENCES `receta`(`idReceta`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `item_receta` ADD CONSTRAINT `item_receta_idIngrediente_fkey` FOREIGN KEY (`idIngrediente`) REFERENCES `ingrediente`(`idIngrediente`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comentario` ADD CONSTRAINT `comentario_idCuenta_fkey` FOREIGN KEY (`idCuenta`) REFERENCES `usuario`(`idCuenta`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comentario` ADD CONSTRAINT `comentario_idPlato_fkey` FOREIGN KEY (`idPlato`) REFERENCES `plato`(`idPlato`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `item_alacena` ADD CONSTRAINT `item_alacena_idCuenta_fkey` FOREIGN KEY (`idCuenta`) REFERENCES `usuario`(`idCuenta`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `item_alacena` ADD CONSTRAINT `item_alacena_idIngrediente_fkey` FOREIGN KEY (`idIngrediente`) REFERENCES `ingrediente`(`idIngrediente`) ON DELETE CASCADE ON UPDATE CASCADE;
