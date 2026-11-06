# Inventario del color al tocar — corazón maestro 3D (PANT-17, commit 7)

Documento de **solo lectura** escrito ANTES de tocar el motor, y medido en Chrome sobre el
árbol `04b4ee2` (cierre del commit 6). Es el inventario que el punto 7 de la orden pide.

## 1. Qué había antes

- **Un solo motor 3D en la aplicación**, el del corazón maestro (`cm3dInit`), más el de la
  transposición que ése reusa a través de `tga3dEscena`. Todo vive dentro de `cm3dInit`:
  `scene`, `cam`, `root`, el renderizador y los arrays `dyn`, `flows`, `pools`, `inOnly`,
  `lbs`, `shells` y `shellsDyn`.
- **Ningún `Raycaster` y ningún manejador de clic sobre el lienzo.** Los únicos gestos eran
  `pointerdown` / `pointermove` / `pointerup`, y los tres sirven para **rotar**: `pointerdown`
  guarda el punto en `drag`, `pointermove` gira `root` y `up()` suelta.
- El único botón del recuadro es `cm3d-frente`, que devuelve la rotación a cero.

## 2. De qué está hecho el dibujo (las piezas que un toque puede alcanzar)

Todas son hijos DIRECTOS de `root` —`add(m)` hace `root.add(m)`—, así que una sola lista las
recorre:

| familia | de dónde sale | cuántas | material |
|---|---|---|---|
| cámaras (pared) | `shell(...)`, cuatro llamadas fijas | 4 | `matV` / `matA`, o `ghost()` con «Por dentro» |
| orejuelas | `ap1`, `ap2` | 2 | `matA`; visibles sólo SIN «Por dentro» |
| venas fijas | cuatro `ttube(...)` de init | 4 | propio, con su color |
| charcos de sangre | `def.forEach` de `build()` | 4 | propio; visibles sólo CON «Por dentro» |
| arterias | `s.ar.forEach` | variable | bulbo + tubo + ramas |
| raíces de vaso | `shellsDyn` | variable | `matV` / `ghost('v')` |
| extras | `s.ex.forEach` — `tube`, `ring`, `disc`, `malla`, `zone`, `leaf`, `cone`, `sph` | variable | propio |
| **partículas de flujo** | `s.fl.forEach` | muchas | `MeshBasicMaterial` |

## 3. Las tres decisiones, y por qué

**(a) El contorno es la propia malla, no un casco invertido ni una geometría nueva.**
Un casco invertido necesita además una pasada de profundidad que escriba sin color, y eso
ocluiría las partículas y los charcos que se ven DENTRO de las cámaras: cambiaría más que el
color, que es justo lo que la orden prohíbe. Con la malla, la pieza conserva su posición, su
escala, su latido y su visibilidad — lo único que cambia es con qué se pinta.

**(b) Las partículas de flujo quedan fuera.** Una partícula no es una estructura: apagar una
bolita de 0,075 de radio no se ve, y lo que el médico perdería es la corriente. Llevan
`userData.cmNoTocar` y no consumen ordinal.

**(c) La clave es el ORDINAL del objeto entre los hijos del grupo, y lo apagado se borra entero
en cuanto la escena cambia.** `build()` crea los objetos en orden determinista, así que el
ordinal es estable mientras se dibuje LO MISMO; con otra anatomía, otra variante o una lesión
más, el ordinal 7 deja de ser la misma arteria. Por eso `build()` compara el estado del dibujo
con el de la pasada anterior y, si cambió, vacía el conjunto. Un repintado del MISMO dibujo
—que es lo que hace cada control— conserva lo apagado.

## 4. Lo que NO se agrega

Ni un campo guardado, ni una columna de Excel, ni un botón, ni un texto, ni una entrada de
`VINFO`, ni una clase de CSS. El único estado nuevo es `_cm3d.sinColor`, memoria de sesión
como `pausado` y `fc`, con prototipo nulo.

## 5. Lo que sí hay que saber, y queda declarado

- **El toque y el arrastre comparten el puntero**, y se separan por la distancia: es un toque
  cuando el puntero no se movió más de 6 px entre el `pointerdown` y el `pointerup`.
- **No hay equivalente de teclado**, porque la orden no autoriza un botón nuevo. → `P17-d`.
- **«Incluir en el PDF» estampa EL CUADRO QUE SE ESTÁ VIENDO**, que es el contrato que ese
  botón ya tenía: una estructura apagada entra al PDF como contorno. → `P17-d`.

## 6. Cómo se midió

`scripts/_probe_pant17col.mjs`, por **píxeles** y no por geometría —un contorno no mueve un
solo punto, que es la lección que PANT-14 dejó escrita—, con el dibujo quieto por
**frecuencia en cero** y no por pausa: con el bucle pausado el lienzo conserva el cuadro
anterior.
