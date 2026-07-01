# Propuesta TP DSW

## Grupo
### Integrantes
53694 - Corvalan, Sebastian 

54197 - Sbuttoni, Candela 

54300 - Urquiza, Mariano


### Repositorios


## Tema
Recetario digital.
### Descripción
El sistema consiste en una aplicación que permite gestionar recetas de cocina de forma digital. Los usuarios podrán cargar, consultar y organizar recetas ingresando nombre, ingredientes y pasos de preparación. Además, podrán buscar recetas por distintos criterios para facilitar su acceso. El objetivo es reemplazar el uso de recetas en papel mediante una herramienta simple y ordenada.

### Modelo
<img width="8190" height="9340" alt="MODELO_TP_DSW_V0 1" src="https://github.com/user-attachments/assets/f639082f-459c-4d01-aa64-c46eb18514ed" />


https://app.diagrams.net/?src=about#G1sc9pZNAJjoqw87PuV9H9PeRhbPGQ2O6C#%7B%22pageId%22%3A%22C5RBs43oDa-KdzZeNtuy%22%7D


## Alcance Funcional 

### Alcance Mínimo

Regularidad:
|Req|Detalle|
|:-|:-|
|CRUD simple|1. CRUD Plato<br>2. CRUD Ingrediente<br>3. CRUD Categoria<br>4. CRUD Usuario|
|CRUD dependiente|1. CRUD Receta {depende de} CRUD Plato<br>2. CRUD IngredienteSustituto {depende de} CRUD Ingrediente<br>3. CRUD Pasos de Receta {depende de} CRUD Receta|
|Listado<br>+<br>detalle| 1. Listado de Recetas filtrado por Categoría => detalle CRUD Receta<br> 2. Búsqueda de recetas por origen.|
|CUU/Epic|1. Registrar un plato con ingredientes<br>2. Gestionar la calificación y comentarios de la experiencia|


Adicionales para Aprobación
|Req|Detalle|
|:-|:-|
|CRUD |1. CRUD Plato<br>2. CRUD Ingrediente<br>3. CRUD Categoria<br>4. CRUD Usuario<br>5. CRUD Comentario<br>6. CRUD Origen<br>7. CRUD Dificultad<br>8. CRUD Administrador|
|CUU/Epic|1. Búsqueda avanzada y consulta detallada de cocción<br>2. Generar ranking de la comunidad con recetas más populares|


