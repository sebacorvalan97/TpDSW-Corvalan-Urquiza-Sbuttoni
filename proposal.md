# Propuesta TP DSW

## Grupo
### Integrantes
53694 - Corvalan, Sebastian 

48455 - Taibbi, Joaquín

54197 - Sbuttoni, Candela 

54300 - Urquiza, Mariano


### Repositorios


## Tema
Recetario digital.
### Descripción
El sistema consiste en una aplicación que permite gestionar recetas de cocina de forma digital. Los usuarios podrán cargar, consultar y organizar recetas ingresando nombre, ingredientes y pasos de preparación. Además, podrán buscar recetas por distintos criterios para facilitar su acceso. El objetivo es reemplazar el uso de recetas en papel mediante una herramienta simple y ordenada.

### Modelo
<img width="703" height="504" alt="image" src="https://github.com/user-attachments/assets/17a64212-afb7-4ec7-a17d-ac77b882a72c" />


## Alcance Funcional 

### Alcance Mínimo

Regularidad:
|Req|Detalle|
|:-|:-|
|CRUD simple|1. CRUD Receta<br>2. CRUD Ingrediente<br>3. CRUD Categoria<br>4. CRUD Usuario|
|CRUD dependiente|1. CRUD Preparación {depende de} CRUD Receta<br>2. CRUD Comentario {depende de} CRUD Receta|
|Listado<br>+<br>detalle| 1.Listado de Recetas filtrado por Categoría => detalle CRUD Receta<br> 2. Búsqueda de recetas por origen.|
|CUU/Epic|1. Registrar una receta completa con ingredientes y pasos<br>2. Gestionar la calificación y comentarios de la experiencia|


Adicionales para Aprobación
|Req|Detalle|
|:-|:-|
|CRUD |1. CRUD Receta<br>2. CRUD Ingrediente<br>3. CRUD Categoria<br>4. CRUD Usuario<br>5. CRUD Comentario<br>6. CRUD Origen<br>7. CRUD Preparación|
|CUU/Epic|1. Búsqueda avanzada y consulta detallada de cocción<br>2. Generar ranking de la comunidad con recetas más populares|


