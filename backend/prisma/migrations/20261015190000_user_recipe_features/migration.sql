ALTER TABLE `ingrediente_sustituto`
ADD COLUMN `notas` VARCHAR(200) NOT NULL DEFAULT '';

CREATE TABLE `favorito` (
    `idCuenta` INTEGER NOT NULL,
    `idReceta` INTEGER NOT NULL,
    `fechaAlta` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_favorito_receta`(`idReceta`),
    PRIMARY KEY (`idCuenta`, `idReceta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `comentario_like` (
    `idCuenta` INTEGER NOT NULL,
    `idComentario` INTEGER NOT NULL,

    INDEX `idx_comentario_like_comentario`(`idComentario`),
    PRIMARY KEY (`idCuenta`, `idComentario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `favorito`
ADD CONSTRAINT `favorito_idCuenta_fkey` FOREIGN KEY (`idCuenta`) REFERENCES `usuario`(`idCuenta`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `favorito_idReceta_fkey` FOREIGN KEY (`idReceta`) REFERENCES `receta`(`idReceta`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `comentario_like`
ADD CONSTRAINT `comentario_like_idCuenta_fkey` FOREIGN KEY (`idCuenta`) REFERENCES `usuario`(`idCuenta`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `comentario_like_idComentario_fkey` FOREIGN KEY (`idComentario`) REFERENCES `comentario`(`idComentario`) ON DELETE CASCADE ON UPDATE CASCADE;
