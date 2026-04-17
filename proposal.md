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
![imagen del modelo]()

*Nota*: incluir un link con la imagen de un modelo, puede ser modelo de dominio, diagrama de clases, DER. Si lo prefieren pueden utilizar diagramas con [Mermaid](https://mermaid.js.org) en lugar de imágenes.

## Alcance Funcional 

### Alcance Mínimo

*Nota*: el siguiente es un ejemplo para un grupo de 3 integrantes para un sistema de hotel. El 

Regularidad:
|Req|Detalle|
|:-|:-|
|CRUD simple|1. CRUD Receta<br>2. CRUD Ingrediente<br>3. CRUD Categoria<br>4. CRUD Usuario|
|CRUD dependiente|1. CRUD Preparación {depende de} CRUD Receta<br>2. CRUD Comentario {depende de} CRUD Receta|
|Listado<br>+<br>detalle| 1.Listado de Recetas filtrado por Categoría => detalle CRUD Receta<br> 2. Búsqueda de recetas por nombre con vista de ingredientes y tiempos.|
|CUU/Epic|1. Crear receta<br>2. Consultar receta|


Adicionales para Aprobación
|Req|Detalle|
|:-|:-|
|CRUD |1. CRUD Tipo Habitacion<br>2. CRUD Servicio<br>3. CRUD Localidad<br>4. CRUD Provincia<br>5. CRUD Habitación<br>6. CRUD Empleado<br>7. CRUD Cliente|
|CUU/Epic|1. Reservar una habitación para la estadía<br>2. Realizar el check-in de una reserva<br>3. Realizar el check-out y facturación de estadía y servicios|


### Alcance Adicional Voluntario

*Nota*: El Alcance Adicional Voluntario es opcional, pero ayuda a que la funcionalidad del sistema esté completa y será considerado en la nota en función de su complejidad y esfuerzo.

|Req|Detalle|
|:-|:-|
|Listados |1. Estadía del día filtrado por fecha muestra, cliente, habitaciones y estado <br>2. Reservas filtradas por cliente muestra datos del cliente y de cada reserve fechas, estado cantidad de habitaciones y huespedes|
|CUU/Epic|1. Consumir servicios<br>2. Cancelación de reserva|
|Otros|1. Envío de recordatorio de reserva por email|

