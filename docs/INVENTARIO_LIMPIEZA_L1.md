# Inventario de la tanda LIMPIEZA-1 — medicion de solo lectura

Lo escribio el **commit 1** de la tanda LIMPIEZA-1 (2026-11-08) y **no cambia un byte de los
archivos que mide**. Es el mapa con el que los commits 2 y 3 reparten los bloques, la
evidencia de por que cada bloque se queda o se archiva, y el **manifiesto** con el que se
reconstruye cada original para comprobar que el md5 no cambio.

⚠️ **Este archivo no se lee entero.** Se busca con `grep -n` por el numero de linea o por el
id, igual que los dos archivos que mide.

## (a) Tamanos ANTES, medidos

| archivo | bytes | lineas | tokens estimados (bytes/4) |
|---|---:|---:|---:|
| `CLAUDE.md` | 880308 | 10627 | 220077 |
| `docs/PENDIENTES.md` | 1007449 | 15373 | 251862 |
| `docs/REGISTRO_TANDAS.md` | 130273 | 1835 | 32568 |
| `docs/fuentes/FUENTES.md` | 943016 | 12272 | 235754 |

Los dos archivos que Code carga al arrancar —`CLAUDE.md` por el encabezado de cada prompt y
`docs/PENDIENTES.md` por la orden «lee PRIMERO»— suman **1887757 bytes, unos 471939 tokens**.

**Las premisas de la orden, verificadas:** decia «CLAUDE.md pesa unos 864 KB»; medido con
`wc -c` son **880308 bytes** (859.7 KiB, 0.88 MB de 10^6). Decia «docs/PENDIENTES.md unos 1 MB»;
medido son **1007449 bytes** (1.01 MB), que coincide. md5 de `index.html` al abrir: `52f7573bcc005697ac9947eac356e151` —esta
tanda NO lo toca—.

## (c) QUIEN LEE O ESCRIBE ESTOS ARCHIVOS — medido, y es el hallazgo del commit 1

**NINGUN caso de la suite, ningun arnes, ningun script y ningun hook lee ni escribe
`CLAUDE.md`, `docs/PENDIENTES.md` ni `docs/REGISTRO_TANDAS.md`.** Medido asi, no leido:

| que se busco | como | resultado |
|---|---|---|
| lectura real de un `.md` desde los scripts | `grep -rnE` por `readFile`, `readFileSync` y `open(` seguidos de `.md`, sobre `scripts/` | **0 hallazgos** |
| lectura de un `.md` desde los `.py` y `.sh` | `grep -rnE` por `.md` entre comillas, sobre `scripts/*.py` y `scripts/*.sh` | **0 hallazgos** |
| `docs/` por patron, glob o `readdir` | `grep -rnE` por `readdir` y `glob` seguidos de `docs` | **0 hallazgos** |
| quien nombra `CLAUDE.md` | `grep -rln` sobre `scripts/` | 20 archivos, **todas las menciones en comentarios de prosa** |
| quien nombra `PENDIENTES` | `grep -rln` sobre `scripts/` | 8 archivos, idem |
| quien nombra `REGISTRO_TANDAS` | `grep -rln` sobre `scripts/` | **0 archivos** |
| hooks del proyecto | `grep -rn` sobre `.claude/` | **0** (solo hay `settings.local.json`) |

De ahi salen dos conclusiones que mandan sobre los commits 2 y 3:

1. **`scripts/sellar_version.py` NO toca `CLAUDE.md`.** Escribe `ECO_BUILD`, `ECO_BUILD_MS` y
   el `<span id="eco-build-sello">` de `index.html`, mas `version.json`. El sello y el renglon
   de tamano de `CLAUDE.md` los escribe **una persona** al cerrar la tanda, y el chequeo «el
   sello coincide con CLAUDE.md» es **manual**: se compara el sello del pie de `index.html`
   contra el renglon de «Que es EcoSmart y como se trabaja». **No hay herramienta que parsee
   un formato**, asi que ningun formato queda cautivo — pero el renglon y el sello se quedan
   donde estan, porque son lo que esa comparacion mira.
2. **Lo que si obliga: los punteros de prosa.** `index.html` nombra `PENDIENTES` **242** veces
   y `CLAUDE.md` **58** en sus comentarios, y `scripts/test_clinico.mjs` nombra ids como
   `P11-a`, `J-a (cerrado)` o `D-d`. Son punteros que un humano sigue con `grep`: un id que
   se archive tiene que seguir apareciendo **exactamente una vez** en el arbol de `docs/`.
   De ahi la regla del reparto: **un id vive en UNO de los dos archivos, nunca en los dos.**

Los casos que se corrieron ANTES del reparto, como base —y que se vuelven a correr despues—:
`TC-533`, `TC-502`, `TC-535`, `TC-471` y `TC-322`, los cinco de inventario y conteo.
**5/5 verde antes.** No son «los casos que leen estos archivos» —no existe ninguno—: son el
control de que la tanda no movio la aplicacion.

## (b) Mapa de secciones de CLAUDE.md

`clase`: **regla** (regla fija, mapa, protocolo, trampa, flujo, seguridad, estado de las tres
ultimas tandas) o **historial** (tanda cerrada anterior).

| linea | niv | bytes | destino | clase | encabezado |
|---:|---:|---:|---|---|---|
| 1 | 1 | 33 | QUEDA | regla | EcoSmart — reglas de trabajo |
| 3 | 2 | 502 | QUEDA | regla | Regla de oro: no leas los archivos largos enteros |
| 14 | 3 | 44044 | QUEDA | regla | Según la tarea, leé este archivo |
| 216 | 2 | 23330 | QUEDA | regla | Qué es EcoSmart y cómo se trabaja |
| 469 | 2 | 2897 | QUEDA | regla | El papel describe — REGLA FIJA DE MAICOL (2026-10-31) |
| 506 | 2 | 2324 | QUEDA | regla | Nada dice que algo está «pendiente de revisión» — REGLA FIJA DE MAICOL (2026-11-02) |
| 539 | 2 | 646 | QUEDA | regla | El nombre de la guia americana de congenitas es «ACC/AHA 2025» — FIJO (2026-11-06) |
| 548 | 2 | 1158 | QUEDA | regla | Un dibujo sin color se dibuja con un ALFA POR PIXEL, no con una malla — REGLA FIJA (2026-11-06) |
| 564 | 2 | 1435 | QUEDA | regla | Todo cartel ⓘ usa la MISMA letra — REGLA FIJA DE MAICOL (2026-11-04) |
| 585 | 2 | 1931 | QUEDA | regla | Ningún texto habla mal de las guías — REGLA FIJA DE MAICOL (2026-11-04) |
| 616 | 2 | 735 | QUEDA | regla | El informe va en ORACIONES SEPARADAS — REGLA FIJA DE MAICOL (2026-11-03) |
| 627 | 2 | 799 | QUEDA | regla | La pantalla: campos a la izquierda, diagrama a la derecha — REGLA FIJA DE MAICOL (2026-10-31) |
| 639 | 2 | 1727 | QUEDA | regla | Las Evidencias de más de 6 preguntas, en dos columnas — REGLA FIJA DE MAICOL (2026-11-02) |
| 662 | 2 | 2168 | QUEDA | regla | Panel de Evidencia — reglas de citación |
| 691 | 2 | 2821 | QUEDA | regla | Protocolo de verificación |
| 734 | 2 | 4593 | QUEDA | regla | Trampas conocidas |
| 791 | 2 | 648 | QUEDA | regla | Flujo de trabajo |
| 803 | 2 | 721 | QUEDA | regla | SEGURIDAD |
| 817 | 2 | 1020 | QUEDA | regla | Estado vigente |
| 831 | 3 | 14677 | QUEDA | regla | La Evidencia de un sector no incluido, y los textos que comparaban fuentes — «PANT-22» (2026-11-07) |
| 1012 | 3 | 14461 | QUEDA | regla | La Evidencia de prótesis, una sección por válvula — «PANT-21» (2026-11-07) |
| 1195 | 3 | 17181 | QUEDA | regla | El catálogo en la mitral, la tricúspide y la pulmonar — «PANT-20» (2026-11-06 y 07) |
| 1408 | 3 | 14509 | ARCHIVA | historial | El catálogo de prótesis por modelo y tamaño — «PANT-19» (2026-11-06) |
| 1592 | 3 | 15115 | ARCHIVA | historial | El tiempo de eyección, el AT/ET, la TAVI graduada y el desajuste — «PANT-18» (2026-11-06) |
| 1775 | 3 | 9891 | ARCHIVA | historial | La transparencia del 3D, la Evidencia que se arma con lo contestado y el control de las diez — «PANT-17b» (202 |
| 1896 | 3 | 16879 | ARCHIVA | historial | La Evidencia de congénitas, la ventana aortopulmonar y el color al tocar — «PANT-17» (2026-11-06) |
| 2106 | 3 | 20650 | ARCHIVA | historial | El PDF del corazón maestro, el diagrama del posoperatorio y los colores del 3D — «PANT-14c» (2026-11-05 y 06) |
| 2357 | 3 | 26310 | ARCHIVA | historial | El estado del corazón maestro, «un dato una sola puerta», el PDF y el túnel violeta — «PANT-14b» (2026-11-05) |
| 2666 | 3 | 22788 | ARCHIVA | historial | El esquema negro, el botón del PDF, la transposición y las siete lesiones — «PANT-14» (2026-11-05) |
| 2936 | 3 | 20405 | ARCHIVA | historial | «Explorar», la transposición dentro del corazón maestro, Masas y el pulmón — «PANT-13» (2026-11-04 y 05) |
| 3185 | 3 | 13026 | ARCHIVA | historial | El corazón maestro en 3D, parte 1 — «PANT-12» (2026-11-04) |
| 3350 | 3 | 23380 | ARCHIVA | historial | El papel de Ebstein y Eisenmenger, la VCI, el eco pulmonar por lado y las masas — «PANT-11» (2026-11-04) |
| 3627 | 3 | 16241 | ARCHIVA | historial | Los textos de congénitas contra las hojas y la Evidencia de cinco lesiones — «PANT-10» (2026-11-04) |
| 3829 | 3 | 17952 | ARCHIVA | historial | Las siete pantallas de congénitas en tres columnas y el valve-in-valve de TAVI — «PANT-9» (2026-11-04) |
| 4049 | 3 | 14970 | ARCHIVA | historial | La pantalla de TAVI, las referencias del VD y el molde de la pulmonar — «PANT-8» (2026-11-04) |
| 4229 | 3 | 28324 | ARCHIVA | historial | El dibujo del VD, los bordes de la CIA, los globos y cuatro pantallas — «PANT-7» (2026-11-03 y 04) |
| 4567 | 3 | 21563 | ARCHIVA | historial | La pantalla de CIA y CIV, el dibujo del VD, el molde de la Evidencia y los criterios TEER — «PANT-6» (2026-11- |
| 4830 | 3 | 21101 | ARCHIVA | historial | El dibujo de sobrecarga del VD, el Forrester y cinco pantallas — «PANT-5» (2026-11-03) |
| 5091 | 3 | 10713 | ARCHIVA | historial | Las dos estenosis aórticas, «Task Force» fuera del papel y los estadios — «PANT-4» (2026-11-03) |
| 5226 | 3 | 16325 | ARCHIVA | historial | Los botones CIA/CIV, el corazón maestro, cuatro pantallas y la arritmia ventricular — «PANT-3» (2026-11-02 y 0 |
| 5428 | 3 | 17078 | ARCHIVA | historial | El PDF de la transposición, el panel compacto y la conclusión descriptiva — «TGA-4» (2026-11-02) |
| 5640 | 3 | 17364 | ARCHIVA | historial | La conclusión a la izquierda, el papel sin conductas y el esquema de circulación — «TGA-3» (2026-11-01) |
| 5858 | 3 | 7410 | ARCHIVA | historial | Los pendientes de AJ3, AJ5, AJ6, J y J2, y el G-a — «AJ7» (2026-10-25) |
| 5953 | 3 | 3864 | ARCHIVA | historial | Blindaje del código de Eco Estrés — «AJ10-B» (2026-10-26) |
| 6005 | 3 | 6758 | ARCHIVA | historial | Los textos de Evidencia y de Referencias — «A» (2026-10-27) |
| 6092 | 3 | 7344 | ARCHIVA | historial | Los espejos en vivo y el dueño único de la PAM — «B» (2026-10-27) |
| 6188 | 3 | 9196 | ARCHIVA | historial | El Carpentier, la tricúspide, el strain del VD y la orejuela — «E» (2026-10-27) |
| 6303 | 3 | 11576 | ARCHIVA | historial | El eco pulmonar, la constricción, el botón de amiloidosis y el Forrester — «C2» (2026-10-28) |
| 6448 | 2 | 3693 | QUEDA | regla | Procedencia — dónde está el origen de cada regla |
| 6485 | 3 | 20947 | ARCHIVA | historial | El diagrama 3D de la transposición — «TGA» (2026-10-31) |
| 6740 | 3 | 6300 | ARCHIVA | historial | La calculadora de riesgo CV y el score de amiloidosis — «D» (2026-10-27) |
| 6823 | 3 | 4818 | ARCHIVA | historial | No se podía borrar lo que el módulo de amiloidosis escribía — «D-9» (2026-10-27) |
| 6885 | 3 | 5966 | ARCHIVA | historial | Lo que el médico encontró probando el D-9 — «D-10» (2026-10-28) |
| 6960 | 3 | 9326 | ARCHIVA | historial | Un dato, dos puertas, gana la última edición — «D-11» (2026-10-28) |
| 7077 | 3 | 6908 | ARCHIVA | historial | VExUS, la HTP, el Forrester, la RVS y el POCUS — «C1» (2026-10-28) |
| 7169 | 3 | 7291 | ARCHIVA | historial | Los cortes del VD por la AHA/ACC 2026 — «TEP» (2026-10-29) |
| 7265 | 3 | 8681 | ARCHIVA | historial | Las pantallas, los anchos y la raíz aórtica — «G» (2026-10-29) |
| 7378 | 3 | 10852 | ARCHIVA | historial | El SGL, los territorios, los patrones y el 2,9 del score — «AJ9» (2026-10-29) |
| 7521 | 3 | 10454 | ARCHIVA | historial | El strain en Referencias, el TRIV y el sexo — «Y, Parte 1» (2026-10-29) |
| 7654 | 3 | 10417 | ARCHIVA | historial | El posoperatorio reordenado — «POP-V2» (2026-10-29) |
| 7785 | 3 | 11626 | ARCHIVA | historial | El banco de imágenes de Guardados y el esquema de la orejuela — «IMÁGENES» (2026-10-29) |
| 7933 | 3 | 10286 | ARCHIVA | historial | La orejuela del ETE y los videos al borrar — «TANDA NOCTURNA, Parte A» (2026-10-30) |
| 8064 | 3 | 8888 | ARCHIVA | historial | El TRIV, el índice aórtico y la aortopatía en el papel — «TANDA NOCTURNA, Parte B» (2026-10-30) |
| 8179 | 3 | 9594 | ARCHIVA | historial | El informe de la orejuela, el TRIV a 75, VD/AD y el dibujo de la demo — «CORRECCIONES» (2026-10-30) |
| 8301 | 3 | 11926 | ARCHIVA | historial | La orejuela, el PDF sin repetir, el EN SUMA de la bicúspide y la fila de miniaturas — «AJUSTES-1» (2026-10-30) |
| 8447 | 3 | 12532 | ARCHIVA | historial | Los segmentos de la Figura 5, la coartación y la Tabla 68 — «AORTA-2» (2026-10-30) |
| 8603 | 3 | 12971 | ARCHIVA | historial | La calculadora sin fármaco, las seis columnas de la Tabla 4 y el monitoreo — «D2» (2026-10-30) |
| 8763 | 3 | 10993 | ARCHIVA | historial | El visor con video, el motor de tercios del PDF y el papel sin guías — «IMÁGENES-3» (2026-10-31) |
| 8904 | 3 | 10230 | ARCHIVA | historial | La coartación sin guías, los diagramas guardados y el barrido del papel — «AJUSTES-2» (2026-10-31) |
| 9038 | 3 | 12026 | ARCHIVA | historial | Jatene y Rastelli, y la Evidencia de congénitas — «TGA-2» (2026-10-31) |
| 9189 | 3 | 19486 | ARCHIVA | historial | El bucle del video, los botones de la Evidencia y la miocardiopatía del PPT — «AJUSTES-3» (2026-10-31) |
| 9442 | 3 | 22410 | ARCHIVA | historial | Lo que se desmarca, la pantalla y el 3D de la TGA, los dibujos TEER y el papel de la MCH — «CONG-2A» (2026-10- |
| 9723 | 3 | 13111 | ARCHIVA | historial | La pantalla del posoperatorio — «POP-A» (2026-11-01) |
| 9887 | 3 | 15483 | ARCHIVA | historial | Los arreglos de POP-A y el dibujo del posoperatorio — «POP-B» (2026-11-01) |
| 10081 | 3 | 10740 | ARCHIVA | historial | La pantalla de Marfan, su tarjeta y el Z de la raíz — «MARFAN-2» (2026-11-02) |
| 10216 | 3 | 7868 | ARCHIVA | historial | La tarjeta de criterios de Marfan con el artículo original — «MARFAN-1» (2026-11-01) |
| 10323 | 3 | 9012 | ARCHIVA | historial | El posoperatorio terminado, Marfan y el dibujo al PDF — «POP-C» (2026-11-02) |
| 10436 | 3 | 14813 | ARCHIVA | historial | Las opciones de plastia, TEER y TAVI, los retoques y el PPT — «VAL-PPT» (2026-11-02) |

## (b-2) Mapa de secciones de docs/PENDIENTES.md — niveles 1 y 2

`subs` son sus items de nivel 3 y `cerr` cuantos de esos llevan marca de cierre en su
encabezado. Clases: **cerrado** (su propio encabezado dice que esta cerrado, con tanda o
fecha, o todos sus sub-items lo dicen) → se archiva; **mezclado** (algunos sub-items
cerrados y otros no) → el bloque QUEDA y se archivan solo sus sub-items cerrados;
**abierto** (ninguna marca de cierre) → queda entero.

| linea | niv | bytes | subs | cerr | clase | encabezado |
|---:|---:|---:|---:|---:|---|---|
| 1 | 1 | 32 | — | — | contenedor · QUEDA | EcoSmart — pendientes vivos |
| 3 | 2 | 3577 | 5 | 0 | abierto · QUEDA | P21-a · Lo que se LEYÓ y NO se pudo escribir, y las premisas que no se reprodujeron |
| 58 | 2 | 362 | 0 | 0 | abierto · QUEDA | P21-b · Lo que no entró por el tope de preguntas |
| 65 | 2 | 1832 | 0 | 0 | abierto · QUEDA | P21-c · Las clase IIa de seguimiento o de diagnóstico, que NO entran |
| 82 | 2 | 810 | 0 | 0 | abierto · QUEDA | P21-d · Lo que el médico anotó para después de Válvulas |
| 97 | 2 | 1435 | 0 | 0 | abierto · QUEDA | P20-a · La Tabla A7 no tiene UNA forma de celda, sino CUATRO |
| 124 | 2 | 1087 | 0 | 0 | abierto · QUEDA | P20-b · La Tabla A8 queda cargada y SIN consumidor |
| 142 | 2 | 841 | 0 | 0 | abierto · QUEDA | P20-c · La pulmonar compara TRES de las cinco columnas, y no es un olvido |
| 155 | 2 | 683 | 0 | 0 | abierto · QUEDA | P20-d · El mensaje de la EOA indexada decía que faltaba un dato del paciente que SÍ estaba |
| 165 | 2 | 313 | 0 | 0 | abierto · QUEDA | P20-e · La Tabla A6 sigue afuera, y P19-d sigue abierto |
| 171 | 2 | 488 | 0 | 0 | abierto · QUEDA | P20-f · Lo que sigue, cuando se retome la serie de prótesis |
| 180 | 2 | 1059 | 0 | 0 | abierto · QUEDA | P17b-a · Lo que se LEYO en imagen y NO hizo falta escribir |
| 197 | 2 | 658 | 0 | 0 | abierto · QUEDA | P17b-b · Las secciones que NO se convirtieron al formato nuevo, y por que |
| 210 | 2 | 1285 | 0 | 0 | abierto · QUEDA | P17b-c · Lo que NO entro por el tope de catorce preguntas |
| 229 | 2 | 646 | 0 | 0 | abierto · QUEDA | P17b-d · Formas que la regla del 04/11 prohibe y que esta tanda NO introdujo |
| 238 | 2 | 1011 | 0 | 0 | abierto · QUEDA | P17b-e · El contraste del halo en el tema claro llega a 2,93 y no a 3 a 1 |
| 254 | 2 | 631 | 0 | 0 | abierto · QUEDA | P17b-f · La captura del PDF estampa el cuadro que se esta viendo |
| 263 | 2 | 1510 | 0 | 0 | abierto · QUEDA | P17-a · Lo que se LEYO y NO se escribio, por no poder verificarlo |
| 285 | 2 | 756 | 0 | 0 | abierto · QUEDA | P17-b · Las hojas que no se abrieron, y por eso no entraron |
| 298 | 2 | 1126 | 0 | 0 | abierto · QUEDA | P17-c · El control de las diez: falta la mitad que exige leer |
| 315 | 2 | 1108 | 0 | 0 | abierto · QUEDA | P17-d · El color al tocar: dos cosas que quedan como estan |
| 333 | 2 | 2476 | 0 | 0 | abierto · QUEDA | P17-e · El renombre a «ACC/AHA 2026» se paro: el titulo oficial dice 2025 |
| 372 | 2 | 1486 | 0 | 0 | abierto · QUEDA | P14b-j · Dos defensas del resolvedor de colores que ninguna mutación puede hacer observable |
| 394 | 2 | 966 | 0 | 0 | abierto · QUEDA | P14b-a · El acceso a las congénitas SÍ tiene una regla, y es la que se usó |
| 412 | 2 | 657 | 0 | 0 | abierto · QUEDA | P14b-b · El nivel de la estenosis pulmonar NO se asume, y la línea lo pide |
| 427 | 2 | 636 | 0 | 0 | abierto · QUEDA | P14b-c · Ninguna sección quedó parada por el punto 2c |
| 440 | 2 | 518 | 0 | 0 | abierto · QUEDA | P14b-d · El estado del esquema de circulación abierto NO se guarda con el estudio |
| 451 | 2 | 1539 | 0 | 0 | abierto · QUEDA | P14b-e · El Laboratorio clasifica el grado diastólico leyendo el TEXTO del informe, y dos frase |
| 479 | 2 | 783 | 0 | 0 | abierto · QUEDA | P14b-f · El esquema del PDF se rasteriza con los colores del tema oscuro |
| 494 | 2 | 750 | 0 | 0 | abierto · QUEDA | P14b-g · Los otros dos túneles quirúrgicos conservan su color |
| 510 | 2 | 667 | 0 | 0 | abierto · QUEDA | P14b-h · El violeta se separa del azul por 42 grados de tono |
| 522 | 2 | 980 | 0 | 0 | abierto · QUEDA | P14b-i · El anillo de la obstrucción subaórtica con «Por dentro» encendido |
| 546 | 2 | 1179 | 0 | 0 | abierto · QUEDA | P14-a · Con qué modo abre el módulo del corazón maestro, y qué sí puede confundir |
| 566 | 2 | 1263 | 0 | 0 | abierto · QUEDA | P14-b · Cuatro casillas del dibujo que ninguna pestaña puede encender |
| 583 | 2 | 590 | 0 | 0 | abierto · QUEDA | P14-c · Las dos estenosis aórticas son UNA lesión del dibujo, y con las dos cargadas gana la su |
| 595 | 2 | 1109 | 0 | 0 | abierto · QUEDA | P14-d · El esquema del módulo y el de la pestaña de la transposición son dos dibujos distintos |
| 615 | 2 | 882 | 0 | 0 | abierto · QUEDA | P14-e · La geometría del esquema contra la demo: la cifra de PANT-13 no se reproduce |
| 631 | 2 | 848 | 0 | 0 | abierto · QUEDA | P14-f · Reabrir un estudio guardado por `editarInforme` no se puede medir en este arnés |
| 647 | 2 | 791 | 0 | 0 | abierto · QUEDA | P14-g · Cinco apariciones de `var(--card)` en la hoja de estilos, sin tocar |
| 662 | 2 | 1402 | 0 | 0 | abierto · QUEDA | P13-a · Los SEIS textos que quedan tras el censo de la regla nueva, y por qué NINGUNO cae bajo  |
| 684 | 2 | 735 | 0 | 0 | abierto · QUEDA | P13-b · La cava superior izquierda persistente sigue sin globo y sin caja de detalle |
| 697 | 2 | 1091 | 0 | 0 | **cerrado · ARCHIVA** | P13-c · [CERRADO 2026-11-05] El dibujo de la transposición SÍ se retiró, y lo que queda es códi |
| 712 | 2 | 1548 | 0 | 0 | abierto · QUEDA | P13-c (nota original) · El dibujo de la transposición NO se retiró de su pestaña, y la medición |
| 736 | 2 | 623 | 0 | 0 | abierto · QUEDA | P13-d · El corte de tres columnas de «Explorar» es 1260 px y no 1200, y lo decidió la medición |
| 746 | 2 | 478 | 0 | 0 | abierto · QUEDA | P13-e · Dos mapas a menos de 1 KB del techo, sin tocar |
| 755 | 2 | 772 | 0 | 0 | abierto · QUEDA | P13-f · Una condición de TC-690 no tiene mutación posible, y se declara |
| 766 | 2 | 2936 | 0 | 0 | abierto · QUEDA | P12-a · Lo que PANT-12 sacó de los textos del corazón maestro, LITERAL, por no tener respaldo |
| 783 | 2 | 735 | 0 | 0 | abierto · QUEDA | P12-b · La casilla nueva va SIN caja de detalle, y lo decide el médico |
| 794 | 2 | 1364 | 0 | 0 | abierto · QUEDA | P12-c · La PARTE 2 del corazón maestro: lo que el motor ya dibuja y la pestaña todavía no cable |
| 813 | 2 | 718 | 0 | 0 | abierto · QUEDA | P12-d · Ninguna pareja incompatible es alcanzable todavía desde el estudio, y está medido |
| 824 | 2 | 677 | 0 | 0 | abierto · QUEDA | P12-e · «Nuevo estudio» cierra el panel del corazón maestro, y es preexistente |
| 835 | 2 | 778 | 0 | 0 | abierto · QUEDA | P12-f · El error de tiempo del motor 3D NO se reproduce en la app, y la sonda queda |
| 848 | 2 | 5107 | 0 | 0 | abierto · QUEDA | P11-a · Lo que el commit 1 de PANT-11 retiró del PAPEL, LITERAL, con su ubicación anterior |
| 870 | 2 | 1242 | 0 | 0 | abierto · QUEDA | P11-b · Lo que cuesta la casilla «no se visualiza VCI», declarado |
| 887 | 2 | 2443 | 0 | 0 | abierto · QUEDA | P11-c · El derrame pleural por lado: lo que se gana, lo que se pierde y una premisa falsa |
| 919 | 2 | 2191 | 0 | 0 | abierto · QUEDA | P11-d · La sincronía del pulmón con el posoperatorio: lo que se paró, y por qué |
| 948 | 2 | 1744 | 0 | 0 | abierto · QUEDA | P11-e · El dibujo del pulmón: lo medido, y qué cuesta |
| 977 | 2 | 828 | 0 | 0 | abierto · QUEDA | P11-f · «Pannus» en el diagnóstico diferencial de las masas — lo decide el médico |
| 989 | 2 | 1457 | 0 | 0 | abierto · QUEDA | P11-g · Los dos globos de las masas no tienen ficha en Referencias, y el motivo es nuevo |
| 1009 | 2 | 1222 | 0 | 0 | abierto · QUEDA | P11-i · El barrido de celular informa UN hallazgo ALTA más, y es un falso positivo medido |
| 1031 | 2 | 1461 | 0 | 0 | abierto · QUEDA | P11-h · Lo que PANT-11 paró, y lo que no alcanzó |
| 1051 | 2 | 12127 | 3 | 0 | abierto · QUEDA | P10-a · Los textos que el commit 1 retiró de los globos, LITERALES, y el que llega al papel |
| 1163 | 2 | 806 | 0 | 0 | abierto · QUEDA | P10-b · La ventana aortopulmonar no tiene Evidencia, y ninguna guía de la biblioteca la trata |
| 1177 | 2 | 2320 | 3 | 0 | abierto · QUEDA | P10-c · Lo que quedó fuera de las preguntas, y por qué |
| 1207 | 2 | 785 | 0 | 0 | abierto · QUEDA | P10-d · Los cortes que la pantalla del DSAV aplica no son los de ninguna de las dos guías |
| 1220 | 2 | 1647 | 0 | 0 | abierto · QUEDA | P10-e · Lo que esta tanda no alcanzó a hacer, y lo que sigue |
| 1246 | 2 | 6753 | 1 | 0 | abierto · QUEDA | P9-a · Los diecisiete textos que pasaron al globo sin respaldo anotado, y el que lleva una cond |
| 1311 | 2 | 860 | 0 | 0 | abierto · QUEDA | P9-b · Seis pantallas de congénitas siguen sin sección de Evidencia |
| 1325 | 2 | 810 | 0 | 0 | abierto · QUEDA | P9-c · Al vaciar la morfología de TAVI, la de Válvulas no se vacía |
| 1337 | 2 | 944 | 0 | 0 | abierto · QUEDA | P9-d · El sentido Válvulas → TAVI es condicional por el filtro del Laboratorio |
| 1350 | 2 | 711 | 0 | 0 | abierto · QUEDA | P9-e · Por debajo del corte de 1260 px, seis de las siete pantallas quedan más altas |
| 1361 | 2 | 334 | 0 | 0 | abierto · QUEDA | P9-f · Las columnas de Ebstein no quedan parejas |
| 1367 | 2 | 674 | 0 | 0 | abierto · QUEDA | P9-g · El globo del título no va dentro del encabezado del acordeón |
| 1377 | 2 | 952 | 0 | 0 | abierto · QUEDA | P9-h · Lo que esta tanda no alcanzó a hacer |
| 1394 | 2 | 990 | 0 | 0 | abierto · QUEDA | P3-a · El caso «casilla de abajo tildada y ninguna lesión marcada» de CIA / CIV |
| 1409 | 2 | 570 | 0 | 0 | abierto · QUEDA | P3-b · El cuadro de resultado de MCH podría ir a la derecha desde ~1200 px |
| 1418 | 2 | 740 | 0 | 0 | abierto · QUEDA | P3-c · La pantalla de MCH a 1000 px baja poco, y es el precio de no tener barra horizontal |
| 1429 | 2 | 764 | 0 | 0 | abierto · QUEDA | P3-d · Los diagramas de la tarjeta de criterios de MCH siguen siendo los de 2020 |
| 1440 | 2 | 676 | 0 | 0 | abierto · QUEDA | P3-e · Dos cosas de la ESC 2022 que la app no publica, leídas en imagen |
| 1452 | 2 | 783 | 0 | 0 | abierto · QUEDA | P3-f · La conclusión de la miocardiopatía arritmogénica nombra dos guías en el papel |
| 1464 | 2 | 673 | 0 | 0 | abierto · QUEDA | P3-g · Dieciséis globos quedan fuera del censo del navegador |
| 1475 | 2 | 839 | 0 | 0 | **cerrado · ARCHIVA** | P3-h · [CERRADO 2026-11-03] Los commits 6 a 10 de PANT-3 se hicieron |
| 1487 | 2 | 1234 | 0 | 0 | abierto · QUEDA | P3-i · La disposición en TRES columnas de Fallot quedó PARADA, y la propuesta |
| 1508 | 2 | 1006 | 0 | 0 | abierto · QUEDA | P3-j · La pantalla de MCA queda MÁS ALTA a 1440 y a 1000 px |
| 1523 | 2 | 423 | 0 | 0 | abierto · QUEDA | P3-k · La sección de MCA tiene DOS grupos que la orden no nombra |
| 1530 | 2 | 955 | 0 | 0 | abierto · QUEDA | P3-l · Cuatro discrepancias entre la Tabla 1 del Task Force y lo que la app escribe |
| 1543 | 2 | 1249 | 1 | 0 | **cerrado · ARCHIVA** | P3-m · [CERRADO 2026-11-03 · PANT4-3] La app afirmaba que la resonancia es el estándar de refer |
| 1562 | 2 | 1007 | 0 | 0 | abierto · QUEDA | P3-n · Las frases de conducta de las dos estenosis aórticas, censadas y NO tocadas |
| 1578 | 2 | 697 | 0 | 0 | abierto · QUEDA | P3-o · El módulo de arritmia ventricular nombra «Task Force 2010» en el papel firmado |
| 1589 | 2 | 831 | 0 | 0 | abierto · QUEDA | P3-p · Los rótulos de presión que NO se cambiaron, y por qué |
| 1603 | 2 | 1116 | 0 | 0 | **cerrado · ARCHIVA** | P3-q · [CERRADO 2026-11-03 · PANT3-12] La fila del TEP decía la sigla dos veces |
| 1618 | 2 | 1675 | 1 | 0 | **cerrado · ARCHIVA** | P3-r · [CERRADO 2026-11-03 · PANT4-7b] El estilo de informe es estado de sesión, y TC-502 no lo |
| 1645 | 2 | 1507 | 0 | 0 | abierto · QUEDA | P3-s · Dos sondas que leían `getComputedStyle` a mitad de una transición |
| 1665 | 2 | 5364 | 7 | 2 | mezclado · QUEDA | Tanda J · pericardio, constricción y VEXUS (2026-10-24) — DECLARADO y NO arreglado |
| 1747 | 2 | 4775 | 7 | 0 | abierto · QUEDA | Tanda R · referencias y fuentes (2026-10-20) — DECLARADO y NO arreglado |
| 1833 | 2 | 6213 | 10 | 0 | abierto · QUEDA | Tanda Y3c · el dibujo estático de la mitral, el plano de corte y las medidas TEER (2026-10-18)  |
| 1931 | 2 | 10196 | 8 | 3 | mezclado · QUEDA | Tanda Y3 · el 3D de la mitral en ETE y la fila de la Vmax (2026-10-16) — DECLARADO y NO arregla |
| 2079 | 2 | 18802 | 14 | 11 | mezclado · QUEDA | Censo W1 · PRÓTESIS mitral y aórtica (2026-10-15) — DECLARADO y NO arreglado |
| 2349 | 2 | 7804 | 12 | 2 | mezclado · QUEDA | Declarado y NO tocado por la tanda W2-B (2026-10-15) |
| 2458 | 2 | 2376 | 4 | 0 | abierto · QUEDA | Tanda W2-A · las tres correcciones de la mitral nativa (2026-10-15) — DECLARADO y NO arreglado |
| 2494 | 2 | 5297 | 5 | 2 | mezclado · QUEDA | Rediseño de Válvulas · D2 — aórtica, tricúspide, tarjetas, THP y color (2026-10-14) — DECLARADO |
| 2568 | 2 | 4955 | 7 | 3 | mezclado · QUEDA | Rediseño de Válvulas · D1 — la mitral en pantalla (2026-10-14) — DECLARADO y NO arreglado |
| 2638 | 2 | 3704 | 5 | 0 | abierto · QUEDA | Aviso de exclusiones mitrales y disfunción sistólica del VD (2026-10-14) — DECLARADO y NO arreg |
| 2691 | 2 | 5399 | 7 | 0 | abierto · QUEDA | Estenosis mitral nativa en el LABORATORIO (2026-10-14) — DECLARADO y NO arreglado |
| 2769 | 2 | 6801 | 8 | 3 | mezclado · QUEDA | Modo manual de las pastillas, selector binario de la EM y VTI tricuspídeo (2026-10-13) — DECLAR |
| 2861 | 2 | 3922 | 8 | 0 | abierto · QUEDA | Las cuatro partes de Válvulas (2026-10-14) — DECLARADO y NO arreglado |
| 2923 | 2 | 6450 | 8 | 3 | mezclado · QUEDA | Cartel de PÉPTIDOS del HFA-PEFF y el plan del usuario (2026-10-13) — DECLARADO y NO arreglado |
| 3021 | 2 | 4002 | 6 | 0 | abierto · QUEDA | Criterios del HFA-PEFF contra el original (2026-10-14) — DECLARADO y NO arreglado |
| 3082 | 2 | 7411 | 8 | 1 | mezclado · QUEDA | Cortes de la estenosis aórtica y estenosis tricuspídea (2026-10-13) — DECLARADO y NO arreglado |
| 3187 | 2 | 7202 | 9 | 1 | mezclado · QUEDA | Borrado en Válvulas: las cuatro lesiones (2026-10-13) — DECLARADO y NO arreglado |
| 3294 | 2 | 3677 | 5 | 0 | abierto · QUEDA | Doppler mitral: el S/D sin legado y los 16 campos en cuatro columnas (2026-10-13) — DECLARADO y |
| 3346 | 2 | 3669 | 7 | 0 | abierto · QUEDA | Diagrama de flujo de la BSE 2024 en la ventana 🧭 (2026-10-13) — DECLARADO y NO arreglado |
| 3403 | 2 | 7007 | 10 | 2 | mezclado · QUEDA | Parámetros complementarios de la función diastólica (2026-10-12) — DECLARADO y NO arreglado |
| 3511 | 2 | 4831 | 8 | 3 | mezclado · QUEDA | Función diastólica ASE/EACVI 2016 en ritmo sinusal (2026-10-12) — DECLARADO y NO arreglado |
| 3585 | 2 | 6830 | 10 | 1 | mezclado · QUEDA | Pared del VD e índice de Tei (2026-10-12) — DECLARADO y NO arreglado |
| 3690 | 2 | 7295 | 10 | 1 | mezclado · QUEDA | Función diastólica BSE 2024 en ritmo sinusal (2026-10-12) — DECLARADO y NO arreglado |
| 3803 | 2 | 9914 | 8 | 2 | mezclado · QUEDA | Función diastólica ASE 2025 (2026-10-12) — DECLARADO y NO arreglado |
| 3934 | 2 | 4490 | 0 | 0 | abierto · QUEDA | Frases largas visibles en el panel de Evidencia (2026-10-11) — REPORTADO y NO tocado |
| 3994 | 2 | 4616 | 7 | 0 | abierto · QUEDA | Estenosis mitral binaria (2026-10-11) — REPORTADO y NO tocado |
| 4064 | 2 | 10932 | 8 | 0 | abierto · QUEDA | Evidencia de la estenosis mitral (2026-10-11) — REPORTADO y NO tocado |
| 4212 | 2 | 4917 | 4 | 0 | abierto · QUEDA | EN SUMA · morfología y prótesis (2026-10-05, parte D) — declarado y NO arreglado |
| 4281 | 2 | 2811 | 0 | 0 | abierto · QUEDA | 3D E2 (2026-10-04) — declarado y NO arreglado |
| 4315 | 2 | 5866 | 2 | 0 | **cerrado · ARCHIVA** | ✅ CERRADO 2026-10-03 — la aórtica entró, y por una tercera salida |
| 4389 | 2 | 1593 | 0 | 0 | abierto · QUEDA | Etapa de cálculos (mitral) |
| 4413 | 2 | 7593 | 0 | 0 | abierto · QUEDA | Aórtica — declarado en la tanda 2/3 (2026-10-01) y NO arreglado |
| 4494 | 2 | 3594 | 0 | 0 | abierto · QUEDA | Aórtica — declarado en la tanda 1/3 (2026-10-01) y NO arreglado |
| 4535 | 2 | 653 | 0 | 0 | abierto · QUEDA | Aórtica (próxima válvula) |
| 4546 | 2 | 2432 | 0 | 0 | abierto · QUEDA | Maquetación de Válvulas — declarado en la tanda del 2026-10-03 y NO arreglado |
| 4577 | 2 | 201 | 0 | 0 | abierto · QUEDA | Visor de imágenes (cineloop) |
| 4582 | 2 | 170 | 0 | 0 | abierto · QUEDA | Imágenes (después de las CC) |
| 4590 | 2 | 3696 | 7 | 0 | abierto · QUEDA | Strain de la AI y onda L (2026-10-12) — DECLARADO y NO arreglado |
| 4649 | 2 | 3768 | 0 | 0 | abierto · QUEDA | Diagramas de flujo de la ASE 2025 y de la ASE/EACVI 2016 (2026-10-13) |
| 4701 | 2 | 6240 | 2 | 0 | abierto · QUEDA | Tanda «F» (2026-10-15) — declarado y NO corregido |
| 4789 | 2 | 12402 | 12 | 3 | mezclado · QUEDA | Tanda «G1» (2026-10-15) — declarado y NO corregido |
| 4983 | 1 | 6236 | — | — | contenedor · QUEDA | Tanda G2 (2026-10-15) — lo declarado y NO tocado |
| 5076 | 2 | 4386 | 6 | 1 | mezclado · QUEDA | La tanda «G3» (2026-10-15) — lo declarado y NO tocado |
| 5147 | 2 | 12900 | 9 | 6 | mezclado · QUEDA | Tanda «Z» (2026-10-15) — DECLARADO y NO arreglado |
| 5325 | 2 | 6497 | 9 | 3 | mezclado · QUEDA | Tanda «Z5» (2026-10-15) — declarado y NO corregido |
| 5423 | 2 | 4879 | 10 | 1 | mezclado · QUEDA | Lo que dejan abiertas las tandas Z6 y Y1 (2026-10-15) |
| 5502 | 2 | 5914 | 9 | 0 | abierto · QUEDA | Vista 2D de las válvulas — tandas «Y1b» y «Y2» (2026-10-16) |
| 5591 | 2 | 7195 | 9 | 0 | abierto · QUEDA | La vista 2D EN LÍNEA — tanda «Y1c» (2026-10-16) — DECLARADO y NO arreglado |
| 5704 | 2 | 7274 | 9 | 1 | mezclado · QUEDA | Tanda «H» — la AI por volumen y las dos correcciones del PDF (2026-10-16) |
| 5826 | 2 | 6185 | 7 | 1 | mezclado · QUEDA | Tanda «Y3b + Wilkins + I» (2026-10-16) — DECLARADO y NO arreglado |
| 5916 | 2 | 6328 | 8 | 1 | mezclado · QUEDA | Tanda «J» (2026-10-16) — DECLARADO y NO arreglado |
| 6023 | 2 | 4183 | 6 | 1 | mezclado · QUEDA | Tanda K · el 3D de la mitral, el bull's eye al PDF y el 3D del ventrículo (2026-10-16) — DECLAR |
| 6087 | 2 | 10894 | 14 | 6 | mezclado · QUEDA | Tanda «L» — el registro de evidencia y las tarjetas ⓘ de AI/VI (2026-10-16) |
| 6253 | 1 | 7435 | — | — | contenedor · QUEDA | Tanda «M» (2026-10-16) — las tarjetas ⓘ de AD/VCI, del VD y de la AORTA |
| 6356 | 2 | 9284 | 10 | 5 | mezclado · QUEDA | Tanda LS · la AI y el VI por SEXO (2026-10-16) — DECLARADO y NO arreglado |
| 6504 | 2 | 5567 | 11 | 1 | mezclado · QUEDA | Tanda VS · el corazón derecho y la raíz aórtica a la Tabla 1 de la ASE 2025 (2026-10-17) — DECL |
| 6597 | 2 | 3765 | 8 | 0 | abierto · QUEDA | Tanda «VAL» · las válvulas NATIVAS alineadas a las guías (2026-10-17) — DECLARADO y NO arreglad |
| 6659 | 2 | 9946 | 8 | 5 | mezclado · QUEDA | Tanda «PRO» (2026-10-17) — commits 1 a 3 hechos, 4 a 6 NO |
| 6805 | 1 | 2815 | — | — | contenedor · QUEDA | Tanda PRO-B (2026-10-17) — lo declarado y NO tocado |
| 6850 | 1 | 6105 | — | — | contenedor · QUEDA | Tanda PRO-C (2026-10-17) — lo declarado y NO tocado |
| 6940 | 2 | 5204 | 10 | 2 | mezclado · QUEDA | Tanda «CORTOS» (2026-10-17) — DECLARADO y NO arreglado |
| 7025 | 2 | 7124 | 7 | 1 | mezclado · QUEDA | Tanda «Q» (2026-10-17) — DECLARADO y NO arreglado |
| 7130 | 1 | 5377 | — | — | contenedor · QUEDA | Tanda ARR (2026-10-18) — lo que queda declarado |
| 7212 | 1 | 4443 | — | — | contenedor · QUEDA | Lo que la tanda «P» declaró y NO tocó (2026-10-18) |
| 7289 | 2 | 6497 | 7 | 4 | mezclado · QUEDA | Tanda Y3d (2026-10-19) — declarado y NO tocado |
| 7384 | 2 | 4075 | 6 | 2 | mezclado · QUEDA | Tanda Y3e (2026-10-20) — lo declarado y no tocado |
| 7446 | 2 | 4574 | 7 | 0 | abierto · QUEDA | Tanda Y3f (2026-10-20) — lo declarado y no tocado |
| 7514 | 2 | 13335 | 17 | 1 | mezclado · QUEDA | Tanda «R2» (2026-10-21) — lo declarado y NO tocado |
| 7716 | 1 | 4749 | — | — | contenedor · QUEDA | Tanda «C» — el TEP (2026-10-21) |
| 7796 | 1 | 6289 | — | — | contenedor · QUEDA | Trabajo «B2» — las correcciones de la reorganización (2026-10-22) |
| 7887 | 2 | 5716 | 8 | 1 | mezclado · QUEDA | El trabajo «H» — LA AORTA (2026-10-21) |
| 7972 | 1 | 9125 | — | — | contenedor · QUEDA | Lo que el trabajo «D» declaró y NO tocó (2026-10-22) |
| 8102 | 2 | 6400 | 9 | 1 | mezclado · QUEDA | Tanda «D2» — las cuatro correcciones del 21/10/2026 |
| 8200 | 2 | 2274 | 3 | 0 | abierto · QUEDA | Tanda D3 (2026-10-21) — la excursión del ASIA desde «Otros» |
| 8239 | 1 | 5213 | — | — | contenedor · QUEDA | La tanda AJ1 — lo declarado y no tocado (22/10/2026) |
| 8325 | 2 | 5619 | 8 | 0 | abierto · QUEDA | Tanda «E» (2026-10-22) — HTP y HF-PEFF: lo declarado y NO tocado |
| 8417 | 1 | 6269 | — | — | contenedor · QUEDA | La tanda «I» — la ETE, la ET y la IP en Fallot reparada (22/10/2026) |
| 8526 | 2 | 5489 | 9 | 0 | abierto · QUEDA | Tanda «AJ2» — lo declarado y NO tocado (2026-10-23) |
| 8607 | 2 | 8434 | 8 | 3 | mezclado · QUEDA | Tanda «AJ3» — lo declarado y NO tocado (2026-10-23) |
| 8758 | 2 | 9083 | 7 | 0 | abierto · QUEDA | Tanda AJ4 · la aorta integrada (2026-10-23) — DECLARADO y NO arreglado |
| 8903 | 2 | 12388 | 10 | 4 | mezclado · QUEDA | Tanda «AJ5» · Tipo de IM y Carpentier en Válvulas, y el strain del VD (2026-10-24) — DECLARADO  |
| 9110 | 2 | 9354 | 7 | 2 | mezclado · QUEDA | Tanda «AJ6» · Fallot, eco pulmonar en columnas, Config y el buscador (2026-10-24) — DECLARADO y |
| 9258 | 2 | 7662 | 6 | 2 | mezclado · QUEDA | Tanda «J2» — lo que quedó declarado y no tocado (2026-10-24) |
| 9390 | 1 | 83 | — | — | contenedor · QUEDA | Tanda «AJ7» — los pendientes de AJ3, AJ5, AJ6, J y J2, y el G-a (2026-10-24) |
| 9392 | 2 | 478 | 0 | 0 | abierto · QUEDA | Lo que esta tanda CERRÓ |
| 9403 | 2 | 1157 | 0 | 0 | abierto · QUEDA | AJ7-a · El gradiente de la línea de Fallot sigue pudiendo salir de la válvula pulmonar |
| 9424 | 2 | 1606 | 0 | 0 | abierto · QUEDA | AJ7-b · Trece de los diecisiete módulos integrables no declaran `hayDatos` |
| 9449 | 2 | 1204 | 0 | 0 | abierto · QUEDA | AJ7-c · La Evidencia de constricción ahora SÍ abre con un perfil diastólico de rutina |
| 9469 | 2 | 692 | 0 | 0 | abierto · QUEDA | AJ7-d · «Un solo centro» no se escribió en la Evidencia de VExUS |
| 9483 | 2 | 742 | 0 | 0 | abierto · QUEDA | AJ7-e · Los otros quince `.vinfo-btn` siguen contados por `check_mobile.js` |
| 9498 | 2 | 885 | 0 | 0 | abierto · QUEDA | AJ7-f · La tanda G no ejecutó quince casos, y nadie lo notó |
| 9515 | 2 | 859 | 0 | 0 | abierto · QUEDA | AJ7-g · Los perfiles temporales viejos siguen ahí, y NO se borraron |
| 9540 | 2 | 1825 | 0 | 0 | abierto · QUEDA | AJ7-h · G-c: qué pierde el Laboratorio, y una propuesta SIN aplicar |
| 9566 | 2 | 1273 | 0 | 0 | abierto · QUEDA | AJ7-i · Cuatro frases de tono de conducta siguen en el POCUS del posoperatorio |
| 9589 | 2 | 686 | 0 | 0 | abierto · QUEDA | AJ7-j · El denominador de la fila de TEER del Laboratorio |
| 9602 | 1 | 70 | — | — | contenedor · QUEDA | Tanda «G» — el posoperatorio de cirugía cardíaca (2026-10-24) |
| 9604 | 2 | 896 | 0 | 0 | abierto · QUEDA | Lo que esta tanda CERRÓ |
| 9617 | 2 | 698 | 0 | 0 | **cerrado · ARCHIVA** | [CERRADO 2026-10-24 · AJ7-8] G-a · Dos copias del umbral de hipertensión pulmonar (20 mmHg) |
| 9628 | 2 | 516 | 0 | 0 | abierto · QUEDA | G-b · La clasificación pre/poscapilar está inline y no se puede reusar |
| 9636 | 2 | 700 | 0 | 0 | abierto · QUEDA | G-c · El Laboratorio pierde la distribución de patrones del POP |
| 9646 | 2 | 416 | 0 | 0 | abierto · QUEDA | G-d · El dibujo no entra al PDF |
| 9653 | 2 | 720 | 0 | 0 | **cerrado · ARCHIVA** | [CERRADO 2026-10-24 · AJ7-6a] G-e · Un hallazgo más de `toque-chico` en el celular |
| 9664 | 2 | 684 | 0 | 0 | abierto · QUEDA | G-f · El híbrido con el corazón anatómico y la frecuencia cardíaca en las animaciones |
| 9676 | 2 | 618 | 0 | 0 | abierto · QUEDA | G-g · El PPT del paciente no se midió de punta a punta |
| 9685 | 1 | 56 | — | — | contenedor · QUEDA | Tanda AJ10-B — blindaje de Eco Estrés (2026-10-26) |
| 9687 | 2 | 5669 | 3 | 0 | abierto · QUEDA | AJ10-C · Borrado del código de Eco Estrés |
| 9777 | 2 | 1291 | 0 | 0 | abierto · QUEDA | A-a · La cabecera de la columna de la ficha del VD sigue diciendo «Mujer» |
| 9796 | 2 | 1342 | 0 | 0 | abierto · QUEDA | A-b · El resto de las tablas de Cardio-Oncología sigue sin tildes |
| 9814 | 2 | 822 | 0 | 0 | abierto · QUEDA | A-c · La leyenda de los corchetes del panel no se movió, y se declara |
| 9826 | 2 | 1061 | 0 | 0 | abierto · QUEDA | A-d · El mensaje «Requiere IC + PCP estimada» sigue mal en la cápsula del módulo |
| 9842 | 2 | 482 | 0 | 0 | abierto · QUEDA | A-e · No hay «mensaje equivalente en la ficha de Referencias» del Forrester |
| 9850 | 2 | 603 | 0 | 0 | abierto · QUEDA | A-f · Las mayúsculas de en medio que quedaron fuera del alcance |
| 9859 | 2 | 1369 | 0 | 0 | abierto · QUEDA | A-g · La regla R4 queda sin aplicar en «Aorta torácica — dilatación y aortopatía» |
| 9879 | 1 | 72 | — | — | contenedor · QUEDA | Tanda B — espejos en vivo y el dueño único de la PAM (2026-10-27) |
| 9881 | 2 | 1627 | 0 | 0 | abierto · QUEDA | B-a · Que la RVS de Hemodinámica lea al dueño único de la PAM |
| 9904 | 2 | 1498 | 0 | 0 | abierto · QUEDA | B-b · Persistir la marca «esta PAM la escribió la app» |
| 9929 | 2 | 878 | 0 | 0 | abierto · QUEDA | B-c · Que la calculada gane con `hemo_pam` borrado a mano |
| 9944 | 2 | 1606 | 0 | 0 | abierto · QUEDA | B-d · El POCUS del posoperatorio no lee `vd_vi` — y el mismo PDF se contradice |
| 9969 | 2 | 825 | 0 | 0 | abierto · QUEDA | B-e · La dosis de una droga no entra al cuerpo del informe ni al EN SUMA |
| 9983 | 2 | 746 | 0 | 0 | abierto · QUEDA | B-f · «Presión arterial invasiva solamente» no abre ningún campo |
| 9995 | 2 | 1527 | 0 | 0 | abierto · QUEDA | B-g · El arnés de A/B de varias tandas no pasaba por el embudo de restauración |
| 10023 | 2 | 1766 | 0 | 0 | abierto · QUEDA | E-e · La distancia más corta entre la zona de implante y la arteria pulmonar (idea, no implemen |
| 10047 | 2 | 1067 | 0 | 0 | abierto · QUEDA | E-a · Carpentier: un estudio con los dos nodos en valores distintos |
| 10063 | 2 | 1731 | 0 | 0 | abierto · QUEDA | E-b · La geometría de dos avisos no se puede medir dentro del suite |
| 10090 | 2 | 1019 | 0 | 0 | abierto · QUEDA | E-c · La celda «Decisión de la aplicación» en la columna «Mujer» (punto 3c, reportado) |
| 10106 | 2 | 1184 | 0 | 0 | abierto · QUEDA | E-d · La rama del trombo sigue dando un veredicto de aptitud |
| 10126 | 2 | 952 | 0 | 0 | abierto · QUEDA | E-f · `docs/mapa/informe-pdf-excel.md` no recibió puntero, y hay que partirlo |
| 10141 | 2 | 1025 | 0 | 0 | abierto · QUEDA | E-g · El cuerpo y el EN SUMA no dicen lo mismo con el strain como único dato de función |
| 10158 | 2 | 1472 | 0 | 0 | abierto · QUEDA | E-h · TC-358 no espera a jsPDF, y por eso es inestable |
| 10191 | 1 | 59 | — | — | contenedor · QUEDA | Tanda D — cardio-oncología y amiloidosis (2026-10-27) |
| 10193 | 2 | 922 | 0 | 0 | abierto · QUEDA | D-a · La app no distingue antraciclina ANTES del anti-HER2 de antraciclina CONCURRENTE |
| 10207 | 2 | 1758 | 0 | 0 | abierto · QUEDA | D-b · Faltan cuatro columnas de la Tabla 4 |
| 10235 | 2 | 1005 | 0 | 0 | abierto · QUEDA | D-c · Tres tablas de referencia publican el esquema que el D-1 retiró |
| 10251 | 2 | 544 | 0 | 0 | abierto · QUEDA | D-d · «Radioterapia toraxica» tiene una x por una c, y corregirlo cambia el Excel |
| 10261 | 2 | 701 | 0 | 0 | abierto · QUEDA | D-e · La Central Illustration de Boldrini no está en la copia de la biblioteca |
| 10273 | 2 | 420 | 0 | 0 | abierto · QUEDA | D-f · «La tabla del score se muestra en gris» quedó sin aplicar |
| 10280 | 2 | 994 | 0 | 0 | abierto · QUEDA | D-g · Las filas de ICI y anti-VEGF de «Monitoreo recomendado» subestiman lo que la guía pide |
| 10294 | 2 | 553 | 0 | 0 | abierto · QUEDA | D-h · Las tres casillas nuevas no se exportan al Excel |
| 10303 | 2 | 941 | 0 | 0 | abierto · QUEDA | D-i · El globo de la calculadora no entra a 390 px |
| 10320 | 1 | 31 | — | — | contenedor · QUEDA | Corrección D-9 (2026-10-27) |
| 10322 | 2 | 3035 | 0 | 0 | abierto · QUEDA | D-j · Inventario de direcciones del módulo de amiloidosis — SOLO REPORTADO |
| 10350 | 2 | 1568 | 0 | 0 | abierto · QUEDA | D-k · Los diecisiete casos del pendrive no son cobertura de esta corrección |
| 10377 | 1 | 32 | — | — | contenedor · QUEDA | Corrección D-10 (2026-10-28) |
| 10379 | 2 | 1620 | 0 | 0 | abierto · QUEDA | D-l · El `e′` promedio del módulo es el único insumo sin camino de vuelta — SOLO REPORTADO |
| 10402 | 2 | 461 | 0 | 0 | abierto · QUEDA | D-m · La guía de prueba del D-9 pedía un defecto en su paso 3 |
| 10409 | 2 | 1316 | 0 | 0 | abierto · QUEDA | D-n · La marca de espejo del D-9 sobrevive a «Nuevo estudio» — SOLO REPORTADO |
| 10429 | 1 | 32 | — | — | contenedor · QUEDA | Corrección D-11 (2026-10-28) |
| 10431 | 2 | 983 | 0 | 0 | abierto · QUEDA | D-o · El `e′` promedio es el único de los ocho datos que no tiene dos puertas — SOLO REPORTADO |
| 10446 | 2 | 1373 | 0 | 0 | abierto · QUEDA | D-p · Los tres campos del encabezado del módulo siguen en un solo sentido — PARADO Y REPORTADO |
| 10466 | 2 | 1705 | 0 | 0 | abierto · QUEDA | D-q · El botón «↓ Traer del formulario» quedó sin trabajo, y además avisa al revés — SOLO REPOR |
| 10490 | 2 | 4150 | 3 | 0 | **cerrado · ARCHIVA** | D-r · [CERRADO 2026-10-28] La suite completa del D-11 — retomada y cerrada |
| 10573 | 2 | 1780 | 0 | 0 | abierto · QUEDA | D-s · `data-espejo` significa dos cosas, y no hay nada que lo impida |
| 10603 | 1 | 52 | — | — | contenedor · QUEDA | Tanda C1 (2026-10-28) — lo que quedó declarado |
| 10605 | 2 | 1157 | 0 | 0 | abierto · QUEDA | C1-a · Dos textos clínicos declaran un corte de congestión que la app NO usa |
| 10626 | 2 | 717 | 0 | 0 | abierto · QUEDA | C1-b · Y el borde del índice cardíaco está declarado del lado que no es |
| 10639 | 2 | 633 | 0 | 0 | abierto · QUEDA | C1-c · Los ejes del diagrama están al revés de lo que la orden pedía |
| 10651 | 2 | 589 | 0 | 0 | abierto · QUEDA | C1-d · Dos vocabularios para los mismos cuatro cuadrantes |
| 10663 | 2 | 601 | 0 | 0 | abierto · QUEDA | C1-e · El Laboratorio tiene un diagrama de Forrester, y NO ubica al paciente en curso |
| 10673 | 2 | 638 | 0 | 0 | abierto · QUEDA | C1-f · `popPatron()` del posoperatorio tiene los DOS defectos que C1-3 cerró en otros lados |
| 10684 | 2 | 659 | 0 | 0 | abierto · QUEDA | C1-g · El arnés de A/B heredado sólo espiaba `addText` del PPT |
| 10695 | 2 | 428 | 0 | 0 | abierto · QUEDA | C1-h · Dos mapas no recibieron puntero, y es a propósito |
| 10703 | 2 | 847 | 0 | 0 | abierto · QUEDA | C1-i · La diferencia (d) de la RVS alcanza a MÁS casos que los que la orden autorizaba |
| 10719 | 1 | 54 | — | — | contenedor · QUEDA | La tanda C2 (2026-10-28) — lo que queda declarado |
| 10721 | 2 | 1165 | 0 | 0 | abierto · QUEDA | C2-a · El médico perdió el interruptor del eco pulmonar, y es el precio del 1h |
| 10740 | 2 | 1021 | 0 | 0 | abierto · QUEDA | C2-b · La anotación de congestión del «Perfil hemodinámico» se movió con la constante |
| 10757 | 2 | 577 | 0 | 0 | abierto · QUEDA | C2-c · Los tres `ic < 2.2` del «Perfil hemodinámico» conservan su operador estricto |
| 10766 | 2 | 683 | 0 | 0 | abierto · QUEDA | C2-d · El bloque de ETT Avanzado se llevó un campo guardado: `am-txt-pulm` |
| 10777 | 2 | 394 | 0 | 0 | abierto · QUEDA | C2-e · El PPT perdió su diapositiva «Ecografía Pulmonar», y es lo que el 1h pedía |
| 10784 | 2 | 376 | 0 | 0 | abierto · QUEDA | C2-f · Faltan en la biblioteca las tres referencias del enunciado D6_11 |
| 10791 | 2 | 429 | 0 | 0 | abierto · QUEDA | C2-g · El artículo original de Forrester tampoco está, y esta vez se censó por contenido |
| 10798 | 2 | 1300 | 0 | 0 | abierto · QUEDA | C2-h · El efecto en los estudios guardados y en el Laboratorio: la regla, no el recuento |
| 10819 | 2 | 586 | 0 | 0 | abierto · QUEDA | C2-i · Los dos vocabularios de cuadrante siguen conviviendo (4e, sólo reportado) |
| 10831 | 1 | 42 | — | — | contenedor · QUEDA | Tanda TEP (2026-10-29) — lo declarado |
| 10833 | 2 | 487 | 0 | 0 | abierto · QUEDA | TEP-a · Las tres referencias de la Tabla 4 que la app no tiene |
| 10842 | 2 | 373 | 0 | 0 | abierto · QUEDA | TEP-b · El trabajo original de McConnell (1996) no está en la biblioteca |
| 10850 | 2 | 520 | 0 | 0 | abierto · QUEDA | TEP-c · La sección de TEP no vive en «la pestaña de ventrículo derecho y TEP» |
| 10859 | 2 | 1188 | 0 | 0 | abierto · QUEDA | TEP-d · La app SÍ asigna categorías de riesgo de TEP, en el panel de Evidencia |
| 10879 | 2 | 350 | 0 | 0 | abierto · QUEDA | TEP-e · Las categorías A a E de la AHA/ACC 2026 no están en ninguna parte |
| 10886 | 2 | 675 | 0 | 0 | abierto · QUEDA | TEP-f · TC-476 y TC-478 son intermitentes por una carrera propia |
| 10899 | 2 | 600 | 0 | 0 | abierto · QUEDA | TEP-g · El pie del cuadro POCUS vuelve a poder mentir |
| 10911 | 1 | 80 | — | — | contenedor · QUEDA | Tanda G — pantallas y anchos (F) más la aorta integrada (AJ8) (2026-10-29) |
| 10913 | 2 | 2246 | 0 | 0 | abierto · QUEDA | La medición del COMMIT 1, con su denominador |
| 10944 | 2 | 952 | 0 | 0 | abierto · QUEDA | F-a · Los 522 globos ⓘ de 16×12 px — BAJA, y es el estado conocido |
| 10959 | 2 | 350 | 0 | 0 | abierto · QUEDA | F-b · Ciento veinte botones entre 28 y 44 px de área táctil — BAJA |
| 10965 | 2 | 297 | 0 | 0 | abierto · QUEDA | F-c · Los 96 SVG de muestra de Config — BAJA |
| 10971 | 2 | 1172 | 0 | 0 | abierto · QUEDA | F-d · Doce tarjetas ⓘ que se leen scrolleando — MEDIA |
| 10994 | 2 | 1313 | 0 | 0 | abierto · QUEDA | F-e · El punto 2a no se reproduce, y está medido |
| 11014 | 2 | 1648 | 0 | 0 | abierto · QUEDA | F-f · El punto 2c NO se puede resolver con el mecanismo de ancho, y está medido |
| 11043 | 2 | 2325 | 0 | 0 | abierto · QUEDA | G-a · Los tres `2.2` del Perfil hemodinámico se alinearon, y su efecto hoy es CERO — medido |
| 11076 | 2 | 3012 | 0 | 0 | abierto · QUEDA | G-b · Los COMMITS 5, 6, 7 y 8 de la tanda G NO SE HICIERON |
| 11116 | 2 | 1489 | 0 | 0 | **cerrado · ARCHIVA** | ~~G-c · La Tabla 62 dice «≥ 45 mm» y la app aplica «> 45»~~ — **CERRADO: ERA FALSO** (tanda Y,  |
| 11140 | 2 | 590 | 0 | 0 | abierto · QUEDA | G-d · El `incRef` de la raíz va al revés que su fuente, y conviven a propósito |
| 11150 | 2 | 629 | 0 | 0 | abierto · QUEDA | G-e · Un estudio guardado con la raíz en los DOS campos y con valores distintos no se reconcili |
| 11161 | 2 | 169 | 0 | 0 | abierto · QUEDA | G-f · `_icBanda` sigue escribiendo el literal 2.2 |
| 11168 | 1 | 42 | — | — | contenedor · QUEDA | Tanda AJ9 (2026-10-29) — lo declarado |
| 11170 | 2 | 796 | 0 | 0 | abierto · QUEDA | AJ9-a · La diferencia del segmento 15 entre Lang y Cerqueira no se pudo verificar |
| 11184 | 2 | 802 | 0 | 0 | abierto · QUEDA | AJ9-b · El patrón «Normal» sigue diciendo «SGL típico: < -20%» |
| 11198 | 2 | 630 | 0 | 0 | abierto · QUEDA | AJ9-c · El panel de cardio-oncología del Laboratorio cuenta mal el strain tipeado en positivo |
| 11209 | 2 | 543 | 0 | 0 | abierto · QUEDA | AJ9-d · «Patognomónico» en el patrón de amiloidosis |
| 11219 | 2 | 1146 | 0 | 0 | abierto · QUEDA | AJ9-e · La app no dice de qué paredes sale la relación ápice/base del score |
| 11240 | 2 | 627 | 0 | 0 | abierto · QUEDA | AJ9-f · El Excel sigue exportando el SGL con el signo que el médico tecleó |
| 11252 | 2 | 551 | 0 | 0 | abierto · QUEDA | AJ9-g · `check_backticks.py` no caza un acento grave dentro de un comentario del template |
| 11264 | 2 | 89 | 0 | 0 | abierto · QUEDA | Tanda POP-V2 · el posoperatorio reordenado (2026-10-29) — DECLARADO y NO arreglado |
| 11266 | 2 | 1062 | 0 | 0 | abierto · QUEDA | POP-a · La vasopresina (y la terlipresina) llevan mcg/kg/min, que es una unidad POR PESO |
| 11284 | 2 | 746 | 0 | 0 | abierto · QUEDA | POP-b · El PiCCO no tiene campo de PAM, y la cascada lo nombra como si lo tuviera |
| 11297 | 2 | 1009 | 0 | 0 | abierto · QUEDA | POP-c · La RVS de `popPatron` sigue sin leer el dueño único, y ahora se ve |
| 11319 | 2 | 724 | 0 | 0 | abierto · QUEDA | POP-d · El timing del balón no sobrevive a reabrir el estudio |
| 11331 | 2 | 740 | 0 | 0 | abierto · QUEDA | POP-e · «Edema pulmonar» es un diagnóstico que este módulo no emite |
| 11344 | 2 | 569 | 0 | 0 | abierto · QUEDA | POP-f · `popAbrirEnEscritorio` es código muerto desde la tanda G |
| 11356 | 2 | 936 | 0 | 0 | abierto · QUEDA | POP-g · Cinco arneses de A/B miden el PPT con todas las casillas apagadas |
| 11372 | 2 | 807 | 0 | 0 | abierto · QUEDA | POP-h · El PPT imprime la CLAVE de la droga, no su nombre |
| 11389 | 2 | 9932 | 9 | 1 | mezclado · QUEDA | La tanda Y, Parte 1 (2026-10-29) — lo declarado y lo que quedó sin hacer |
| 11536 | 2 | 5610 | 7 | 0 | abierto · QUEDA | Tanda IMÁGENES (2026-10-29) — lo que el commit 1 midió y hay que reportar |
| 11623 | 2 | 7488 | 8 | 0 | abierto · QUEDA | TANDA NOCTURNA — Parte A (la orejuela del ETE y los videos), 2026-10-30 |
| 11741 | 2 | 6392 | 7 | 0 | abierto · QUEDA | TANDA NOCTURNA — Parte B (AORTA-1), 2026-10-30 |
| 11841 | 1 | 4997 | — | — | contenedor · QUEDA | La TANDA CORRECCIONES (2026-10-30) — lo que se paró y se declara |
| 11925 | 2 | 5167 | 7 | 0 | abierto · QUEDA | Tanda AJUSTES-1 (2026-10-30) |
| 12015 | 1 | 46 | — | — | contenedor · QUEDA | TANDA AORTA-2 (2026-10-30) — lo declarado |
| 12017 | 2 | 2945 | 0 | 0 | abierto · QUEDA | AO2-a · INVENTARIO de la válvula aórtica TRICÚSPIDE (punto 3c) — sólo reportado |
| 12058 | 2 | 1211 | 0 | 0 | abierto · QUEDA | AO2-b · La línea INTEGRADA de la coartación en el EN SUMA publica clase y guía |
| 12076 | 2 | 565 | 0 | 0 | abierto · QUEDA | AO2-c · La conclusión de la coartación lleva clase, nivel, tabla y folio al informe |
| 12085 | 2 | 971 | 0 | 0 | abierto · QUEDA | AO2-d · Un segmento «sin clasificar» no bloquea la negación global del EN SUMA |
| 12099 | 2 | 857 | 0 | 0 | abierto · QUEDA | AO2-e · Lo contestado en el panel sobre los nueve factores no viaja con el estudio |
| 12112 | 2 | 539 | 0 | 0 | abierto · QUEDA | AO2-f · `vabFrChk` y `vabFrChkSync` quedaron sin elemento que tocar |
| 12120 | 2 | 488 | 0 | 0 | abierto · QUEDA | AO2-g · Dos mapas quedaron a menos de 1 KB del techo |
| 12128 | 2 | 922 | 0 | 0 | abierto · QUEDA | Cerrado por esta tanda |
| 12143 | 1 | 41 | — | — | contenedor · QUEDA | TANDA D2 (2026-10-30) — lo declarado |
| 12145 | 2 | 1341 | 0 | 0 | abierto · QUEDA | D2-a · La casilla de antecedente coronario junta tres filas de la Tabla 4, y con anti-VEGF no v |
| 12169 | 2 | 711 | 0 | 0 | abierto · QUEDA | D2-b · La tabla B de HFA-ICOS no tiene equivalente en la Tabla 4 |
| 12181 | 2 | 735 | 0 | 0 | abierto · QUEDA | D2-c · «Radioterapia toraxica» sigue con la x, y corregirlo sigue cambiando el Excel |
| 12192 | 2 | 564 | 0 | 0 | abierto · QUEDA | D2-d · La Central Illustration de Boldrini sigue sin estar en la copia de la biblioteca |
| 12200 | 2 | 848 | 0 | 0 | abierto · QUEDA | D2-e · El globo del monitoreo scrollea adentro, igual que el de la calculadora |
| 12214 | 2 | 865 | 0 | 0 | abierto · QUEDA | D2-f · Las filas de monitoreo viven en TRES tablas, y nada las ata |
| 12228 | 2 | 620 | 0 | 0 | abierto · QUEDA | D2-g · La `_hfaicosAlcance` quedó con un solo texto y su parámetro sin usar |
| 12240 | 2 | 4930 | 7 | 0 | abierto · QUEDA | Tanda AJUSTES-2 (2026-10-31) |
| 12309 | 2 | 8243 | 13 | 2 | mezclado · QUEDA | Tanda IMÁGENES-3 (2026-10-31) |
| 12430 | 1 | 11642 | — | — | contenedor · QUEDA | TANDA TGA (2026-10-31) — el diagrama 3D de la transposición |
| 12607 | 1 | 10616 | — | — | contenedor · QUEDA | TANDA TGA-2 (2026-10-31) — lo declarado |
| 12762 | 1 | 53 | — | — | contenedor · QUEDA | TANDA AJUSTES-3 (2026-10-31) — lo que se declara |
| 12764 | 2 | 1188 | 0 | 0 | abierto · QUEDA | AJ3-a · La etiqueta «AHA/ACC 2020» en el informe, el EN SUMA y el PDF |
| 12783 | 2 | 774 | 0 | 0 | abierto · QUEDA | AJ3-b · El cuerpo del informe que el PPT proyecta sigue nombrando guías |
| 12797 | 2 | 977 | 0 | 0 | abierto · QUEDA | AJ3-c · El texto «el video no arranca solo» del PPT no se tocó, y es deliberado |
| 12812 | 2 | 1072 | 0 | 0 | abierto · QUEDA | AJ3-d · `congenitas-otros.md` sigue al techo, y dónde conviene partirlo |
| 12829 | 2 | 466 | 0 | 0 | abierto · QUEDA | AJ3-e · El orden de los videos dentro de la grilla de «Imágenes guardadas» |
| 12836 | 2 | 813 | 0 | 0 | abierto · QUEDA | AJ3-f · El `spid` es `max + 1` y el experimento cableaba 10 |
| 12849 | 2 | 681 | 0 | 0 | abierto · QUEDA | AJ3-g · El bucle no se puede verificar sin abrir PowerPoint |
| 12862 | 1 | 42 | — | — | contenedor · QUEDA | TANDA CONG-2A (2026-10-31 y 2026-11-01) |
| 12864 | 2 | 1670 | 0 | 0 | abierto · QUEDA | C2A-a · La morfología aórtica sobrevive al desmarcado del tipo de fusión, y NO se tocó |
| 12886 | 2 | 892 | 0 | 0 | abierto · QUEDA | C2A-b · El blindaje del recuadro del 3D no tiene cobertura propia |
| 12901 | 2 | 1067 | 0 | 0 | abierto · QUEDA | C2A-c · Las tres etiquetas de los criterios TEER llegan a la hoja del PDF |
| 12918 | 2 | 601 | 0 | 0 | abierto · QUEDA | C2A-d · El ductus no se extendió a las otras anatomías del 3D |
| 12929 | 2 | 837 | 0 | 0 | abierto · QUEDA | C2A-e · La mención de «guía» que queda en el informe y en el PDF, y no es de la miocardiopatía |
| 12942 | 2 | 605 | 0 | 0 | abierto · QUEDA | C2A-f · Las dos anatomías que no dibujan una comunicación |
| 12952 | 2 | 630 | 0 | 0 | abierto · QUEDA | C2A-g · Por debajo de 1000 px el dibujo de la TGA es más chico que antes |
| 12964 | 2 | 1159 | 0 | 0 | abierto · QUEDA | C2A-h · Dos trampas de método que esta tanda pagó, para la próxima |
| 12982 | 2 | 90 | 0 | 0 | abierto · QUEDA | Tanda POP-A · la pantalla del posoperatorio (2026-11-01) — DECLARADO y NO arreglado |
| 12984 | 2 | 981 | 0 | 0 | abierto · QUEDA | PA-a · El azul de metileno no tiene unidad ni fórmula por peso declaradas |
| 13000 | 2 | 721 | 0 | 0 | abierto · QUEDA | PA-b · El azul de metileno no entra a ningún algoritmo, y la guía está guardada |
| 13012 | 2 | 759 | 0 | 0 | abierto · QUEDA | PA-c · El relleno capilar y la diuresis se describen y no votan |
| 13025 | 2 | 1326 | 0 | 0 | abierto · QUEDA | PA-d · La casilla «Otra» no tiene token en `pop_cx_tipo`, y por qué |
| 13046 | 2 | 1822 | 0 | 0 | abierto · QUEDA | PA-e · Pleura y pulmón NO se unificaron: SEIS contradicciones entre dos dueños |
| 13070 | 2 | 997 | 0 | 0 | abierto · QUEDA | PA-f · Los rótulos PSAP, PmAP y PDAP sólo se unificaron en ESTA pestaña |
| 13085 | 2 | 706 | 0 | 0 | abierto · QUEDA | PA-g · El PPT publica la clave de la droga, no su nombre (POP-h, sigue abierto) |
| 13097 | 2 | 286 | 0 | 0 | abierto · QUEDA | PA-h · El timing del balón sigue sin sobrevivir al guardado (POP-d, sigue abierto) |
| 13102 | 2 | 1240 | 0 | 0 | abierto · QUEDA | PA-i · El Laboratorio publica la CLAVE de cinco de los once fármacos, y el azul es el quinto |
| 13122 | 2 | 112 | 0 | 0 | abierto · QUEDA | Tanda POP-B · el dibujo del posoperatorio y los arreglos de POP-A (2026-11-01) — DECLARADO y NO |
| 13124 | 2 | 1802 | 0 | 0 | abierto · QUEDA | POPB-a · «Integrar al informe» necesita la superficie corporal, y eso NO es una regresión |
| 13153 | 2 | 1202 | 0 | 0 | abierto · QUEDA | POPB-b · La disposición deja huecos de más de 120 px, y por eso NO se inventó otra |
| 13176 | 2 | 887 | 0 | 0 | abierto · QUEDA | POPB-c · Plastia, TEER y TAVI no entran en el tipo de una válvula operada |
| 13190 | 2 | 847 | 0 | 0 | abierto · QUEDA | POPB-d · El anillo del derrame pericárdico NO sigue al tamaño, contra lo que el pedido supone |
| 13203 | 2 | 522 | 0 | 0 | abierto · QUEDA | POPB-e · El dibujo del posoperatorio sigue sin entrar al PDF |
| 13212 | 2 | 1050 | 0 | 0 | abierto · QUEDA | POPB-f · Las válvulas laten con la frecuencia del paciente y las cavidades no |
| 13228 | 2 | 676 | 0 | 0 | abierto · QUEDA | POPB-g · El conteo de fármacos no nombra la asistencia en ninguna parte del panel |
| 13238 | 2 | 1797 | 0 | 0 | abierto · QUEDA | POPB-h · Tres usos GLOBALES de `var(--amber)` que no resuelven, encontrados en passing |
| 13266 | 2 | 3471 | 8 | 0 | abierto · QUEDA | Tanda MARFAN-1 (2026-11-01) — lo declarado |
| 13318 | 2 | 6763 | 8 | 0 | abierto · QUEDA | Tanda MARFAN-2 (2026-11-02) — la pantalla, la tarjeta, la conclusión y el Z |
| 13406 | 2 | 57 | 0 | 0 | abierto · QUEDA | Tanda POP-C (2026-11-02) — DECLARADO y NO arreglado |
| 13408 | 2 | 796 | 0 | 0 | abierto · QUEDA | POPC-a · El corte de 21 mm del pericardio no existe: no había nada que alinear |
| 13423 | 2 | 497 | 0 | 0 | abierto · QUEDA | POPC-b · El Z calculado usa el modelo con BSA y no el de altura |
| 13431 | 2 | 532 | 0 | 0 | abierto · QUEDA | POPC-c · La app no registra con qué técnica se midió «Aorta sinusal» |
| 13439 | 2 | 550 | 0 | 0 | abierto · QUEDA | POPC-d · El Z calculado no se guarda, y eso tiene un precio |
| 13447 | 2 | 715 | 0 | 0 | abierto · QUEDA | POPC-e · La divergencia del corte de bajo gasto entre el posoperatorio y Hemodinámica |
| 13457 | 2 | 543 | 0 | 0 | abierto · QUEDA | POPC-f · El patrón de hipovolemia sigue leyendo el piso de precarga que la fila retiró |
| 13465 | 2 | 584 | 0 | 0 | abierto · QUEDA | POPC-g · El esquema del posoperatorio no se guarda en «Imágenes» |
| 13474 | 2 | 752 | 0 | 0 | abierto · QUEDA | POPC-h · La rasterización es diferida porque el generador del PDF no es asíncrono |
| 13485 | 2 | 310 | 0 | 0 | abierto · QUEDA | POPC-i · Plastia, TEER y TAVI siguen fuera del tipo de una válvula operada |
| 13491 | 2 | 304 | 0 | 0 | abierto · QUEDA | POPC-j · Los huecos entre columnas del posoperatorio quedan como están |
| 13497 | 2 | 1132 | 0 | 0 | abierto · QUEDA | POPC-k · El bucle del dibujo del posoperatorio no vuelve a arrancar al reaparecer |
| 13514 | 2 | 724 | 0 | 0 | abierto · QUEDA | POPC-l · El botón «Usar este valor» del Z mide 95×30 y no 44 px |
| 13525 | 1 | 44 | — | — | contenedor · QUEDA | TANDA TGA-3 (2026-11-01) — lo declarado |
| 13527 | 2 | 1114 | 0 | 0 | abierto · QUEDA | T3-a · El esquema va al lado del 3D desde 1200 px y no desde 900, y es una medición |
| 13545 | 2 | 645 | 0 | 0 | abierto · QUEDA | T3-b · El `resumen` de `tgaConclusion` conserva la conducta y hoy no lo lee ninguna superficie |
| 13557 | 2 | 721 | 0 | 0 | abierto · QUEDA | T3-c · El esquema no entra al PDF ni se guarda en «Imágenes» |
| 13569 | 2 | 905 | 0 | 0 | abierto · QUEDA | T3-d · La diapositiva del PPT no tiene condición en la suite |
| 13585 | 2 | 968 | 0 | 0 | abierto · QUEDA | T3-e · La conducta sigue en la PANTALLA, y la ampliación de la regla fija no se aplicó acá |
| 13600 | 2 | 1268 | 0 | 0 | abierto · QUEDA | T3-f · Lo que la Evidencia NO cubre de las conductas retiradas |
| 13619 | 2 | 866 | 0 | 0 | abierto · QUEDA | T3-g · El `pisaConcl` de dos arneses medía un solo eje |
| 13634 | 1 | 46 | — | — | contenedor · QUEDA | TANDA VAL-PPT (2026-11-02) — lo declarado |
| 13636 | 2 | 2097 | 0 | 0 | abierto · QUEDA | VP-a · El commit 5b se PARÓ: cuatro conductas de la TGA no están en la Evidencia |
| 13664 | 2 | 768 | 0 | 0 | abierto · QUEDA | VP-b · El 6a no se reproduce: el resumen de la VAB SÍ dice «VAB» |
| 13675 | 2 | 614 | 0 | 0 | abierto · QUEDA | VP-c · El Laboratorio no recibe los valores nuevos, por orden expresa |
| 13685 | 2 | 470 | 0 | 0 | abierto · QUEDA | VP-d · Dos menciones de «AHA/ACC 2020» del Laboratorio quedan sin actualizar |
| 13692 | 2 | 537 | 0 | 0 | abierto · QUEDA | VP-e · Los videos de una diapositiva no arrancan con un solo clic |
| 13700 | 2 | 372 | 0 | 0 | abierto · QUEDA | VP-f · La reproducción real no se puede automatizar |
| 13707 | 2 | 371 | 0 | 0 | abierto · QUEDA | VP-g · La clave `prot` de `popVEstado` se quedó con el nombre corto |
| 13714 | 2 | 445 | 0 | 0 | abierto · QUEDA | VP-h · «TAVI de cambio»: la app no guarda un eco de base |
| 13721 | 2 | 509 | 0 | 0 | abierto · QUEDA | VP-i · PISA y EROA siguen visibles con un TEER |
| 13729 | 2 | 922 | 0 | 0 | abierto · QUEDA | VP-j · El aviso de exclusiones mitrales de la diastólica no se dispara con una plastia ni con u |
| 13744 | 2 | 61 | 0 | 0 | abierto · QUEDA | Tanda CORR-EVID (2026-11-02) — DECLARADO y NO arreglado |
| 13746 | 2 | 799 | 0 | 0 | abierto · QUEDA | CE-a · La estenosis NO se fusiona en la línea de la válvula reparada |
| 13759 | 2 | 1408 | 0 | 0 | abierto · QUEDA | CE-b · El símbolo del dibujo sólo aparece con la válvula operada MARCADA |
| 13782 | 2 | 2700 | 0 | 0 | abierto · QUEDA | CE-c · El rótulo de la miocardiopatía hipertrófica, y qué es lo que el médico ve |
| 13819 | 2 | 1679 | 0 | 0 | abierto · QUEDA | CE-d · La conclusión de pantalla de la TGA: el commit 8 se PARÓ, y cuánto falta |
| 13838 | 2 | 523 | 0 | 0 | abierto · QUEDA | CE-e · La línea de guía de la CIV sigue en `escGuchCiv`, y es deliberado |
| 13847 | 2 | 416 | 0 | 0 | abierto · QUEDA | CE-f · Las preguntas que la orden dejó fuera, a la espera de un especialista |
| 13854 | 2 | 474 | 0 | 0 | abierto · QUEDA | CE-g · El pendrive `DISK_IMG` no estaba montado al abrir la sesión |
| 13863 | 1 | 44 | — | — | contenedor · QUEDA | TANDA TGA-4 (2026-11-02) — lo declarado |
| 13865 | 2 | 1890 | 0 | 0 | abierto · QUEDA | T4-a · La aplicación tiene DOS cortes para la obstrucción subaórtica: 40 en su sección y 50 en  |
| 13891 | 2 | 1450 | 0 | 0 | abierto · QUEDA | T4-b · Lo que se perdió de la pantalla de la TGA con la conclusión descriptiva |
| 13910 | 2 | 651 | 0 | 0 | abierto · QUEDA | T4-c · La cláusula del bloqueo auriculoventricular se perdió también de la pantalla |
| 13919 | 2 | 600 | 0 | 0 | abierto · QUEDA | T4-d · El lienzo del 3D se estampa CUADRADO en el PDF, y es preexistente |
| 13928 | 2 | 534 | 0 | 0 | abierto · QUEDA | T4-e · El esquema del PDF no se guarda con el estudio ni en «Imágenes» |
| 13936 | 2 | 332 | 0 | 0 | abierto · QUEDA | T4-f · Los símbolos de las válvulas del posoperatorio se QUEDAN como están |
| 13942 | 2 | 515 | 0 | 0 | abierto · QUEDA | T4-g · El ⓘ de una nota plegada no es un botón de 44 px |
| 13950 | 2 | 460 | 0 | 0 | abierto · QUEDA | T4-h · A 390 px el panel compacto de la TGA es más alto que antes |
| 13957 | 1 | 45 | — | — | contenedor · QUEDA | TANDA PANT-2 (2026-11-02) — lo declarado |
| 13959 | 2 | 1453 | 0 | 0 | abierto · QUEDA | P2-a · Los commits 2 a 8 NO se hicieron, y ninguno quedó a medias |
| 13979 | 2 | 754 | 0 | 0 | abierto · QUEDA | P2-b · La frase de dato faltante que queda en `resumen` y hoy no llega al papel |
| 13991 | 2 | 719 | 0 | 0 | abierto · QUEDA | P2-c · El panel de Evidencia del posoperatorio no usa el molde y queda fuera de la regla |
| 14003 | 2 | 390 | 0 | 0 | abierto · QUEDA | P2-d · El botón «⇔ columnas» se queda, y por qué |
| 14010 | 2 | 512 | 0 | 0 | abierto · QUEDA | P2-e · El chequeo de documentación de las secciones compactas nació vencido otra vez |
| 14018 | 2 | 1255 | 0 | 0 | abierto · QUEDA | P2-f · El texto del realce tardío de la pantalla de MCH se PARÓ |
| 14038 | 2 | 575 | 0 | 0 | abierto · QUEDA | P2-g · Los cinco campos de tipo 2 de la auditoría no se unieron |
| 14047 | 2 | 497 | 0 | 0 | abierto · QUEDA | P2-h · La asimetría de la arritmia ventricular en MCH, que el commit 7 cerraría |
| 14057 | 2 | 874 | 0 | 0 | abierto · QUEDA | P4-a · La disposición en TRES columnas de Fallot sigue PARADA, y la condición no se cumple |
| 14069 | 2 | 1315 | 0 | 0 | abierto · QUEDA | P4-b · La premisa de P3-j es FALSA, medida en los dos árboles con la misma sonda |
| 14092 | 2 | 911 | 0 | 0 | abierto · QUEDA | P4-c · El «seguimiento anual» de las dos estenosis aórticas salió de la pantalla y NO entró a l |
| 14105 | 2 | 666 | 0 | 0 | abierto · QUEDA | P4-d · «La AHA/ACC retiró la respuesta tensional explícitamente en 2020» — PARADO |
| 14114 | 2 | 520 | 0 | 0 | abierto · QUEDA | P4-e · Los cortes indexados del tracto de salida siguen sin aplicarse, y es deliberado |
| 14122 | 2 | 995 | 0 | 0 | abierto · QUEDA | P4-f · Faltan los estadios de CUATRO válvulas |
| 14141 | 2 | 606 | 0 | 0 | abierto · QUEDA | P4-g · Las otras doce citas de aorta se movieron de edición junto con la de Marfan |
| 14150 | 2 | 696 | 0 | 0 | abierto · QUEDA | P4-h · El `resumen` de la miocardiopatía arritmogénica no tenía cobertura |
| 14160 | 2 | 562 | 0 | 0 | abierto · QUEDA | P4-i · La mutación «el estadio llega al papel» no se puede escribir, y se declara |
| 14168 | 2 | 2275 | 0 | 0 | abierto · QUEDA | P5-a · Las 49 líneas de conclusión de congénitas que nombran una guía |
| 14200 | 2 | 731 | 0 | 0 | abierto · QUEDA | P5-b · La tercera aparición del mensaje del Forrester está PARADA |
| 14212 | 2 | 873 | 0 | 0 | abierto · QUEDA | P5-c · La tipografía del dibujo del VD a la mitad del esquema valvular |
| 14226 | 2 | 486 | 0 | 0 | abierto · QUEDA | P5-d · El rótulo de la velocidad máxima se superpone con el chorro |
| 14234 | 2 | 1374 | 0 | 0 | abierto · QUEDA | P5-e · La disposición en tres columnas de la mitral del ETE está PARADA |
| 14255 | 2 | 1162 | 0 | 0 | abierto · QUEDA | P5-f · La profundidad de coaptación: un duplicado AMBIGUO, PARADO |
| 14274 | 2 | 816 | 0 | 0 | abierto · QUEDA | P5-g · La premisa (iii) del commit 6 es parcialmente falsa, y está medida |
| 14288 | 2 | 629 | 0 | 0 | abierto · QUEDA | P5-h · El área de la mitral vive en TRES campos |
| 14298 | 2 | 716 | 0 | 0 | abierto · QUEDA | P5-i · El texto cortado de «Datos usados en el dibujo» no se pudo reproducir |
| 14310 | 2 | 324 | 0 | 0 | abierto · QUEDA | P5-j · El desplazamiento horizontal de 30 px a 899 y 900 px es PREEXISTENTE |
| 14318 | 1 | 28 | — | — | contenedor · QUEDA | TANDA PANT-6 (2026-11-03) |
| 14320 | 2 | 1193 | 0 | 0 | abierto · QUEDA | P6-a · La Evidencia de la válvula pulmonar y de la prótesis mitral quedan SIN molde |
| 14338 | 2 | 1358 | 0 | 0 | abierto · QUEDA | P6-b · La letra del dibujo del VD a 1000 y a 390 px |
| 14361 | 2 | 662 | 0 | 0 | abierto · QUEDA | P6-c · La franja rosa vacía de los criterios TEER no se reproduce como defecto |
| 14371 | 2 | 387 | 0 | 0 | abierto · QUEDA | P6-d · `vdscRotulos()` no existe |
| 14378 | 2 | 202 | 0 | 0 | abierto · QUEDA | P6-e · TC-337 falla idéntico contra HEAD |
| 14383 | 2 | 1393 | 0 | 0 | abierto · QUEDA | P6-f · Los dos campos de la profundidad de coaptación siguen sin sincronizarse |
| 14402 | 2 | 550 | 0 | 0 | abierto · QUEDA | P6-g · El recorte del acordeón de CIA/CIV era PREEXISTENTE, y se cerró de paso |
| 14410 | 2 | 1131 | 0 | 0 | abierto · QUEDA | P6-h · `mitral-dibujo-estatico.md` quedó a 1,2 KB del techo |
| 14426 | 2 | 1131 | 0 | 0 | abierto · QUEDA | P6-i · Los seis globos de síntomas miden 17 × 12 px, y es la convención del panel |
| 14443 | 2 | 1538 | 0 | 0 | abierto · QUEDA | P6-j · TC-99, TC-100 y TC-490 son INTERMITENTES, y ninguno es de esta tanda |
| 14468 | 1 | 33 | — | — | contenedor · QUEDA | Tanda PANT-7 (2026-11-03 y 04) |
| 14470 | 2 | 1132 | 0 | 0 | abierto · QUEDA | P7-a · El punto 10a NO se hizo: las referencias del tronco de la arteria pulmonar, sus ramas y  |
| 14489 | 2 | 707 | 0 | 0 | abierto · QUEDA | P7-b · El commit 11 NO se hizo: el molde de Evidencia de la válvula pulmonar y de la prótesis m |
| 14498 | 2 | 1640 | 0 | 0 | abierto · QUEDA | P7-c · La profundidad de coaptación NO se sincronizó, y ahora con la medición (cierra la pregun |
| 14522 | 2 | 1297 | 0 | 0 | abierto · QUEDA | P7-d · Los dos cuadros de notas se PARARON, con una pregunta concreta para el médico |
| 14541 | 2 | 595 | 0 | 0 | abierto · QUEDA | P7-e · `.mAviso` sigue ilegible en el tema claro, y la comparten 56 elementos |
| 14551 | 2 | 452 | 0 | 0 | abierto · QUEDA | P7-f · El perfil hemodinámico y la clasificación HTP escriben al papel SU PROPIA frase de dato  |
| 14558 | 2 | 478 | 0 | 0 | abierto · QUEDA | P7-g · Las otras tres frases de «no determinable» que la orden no nombra |
| 14567 | 2 | 714 | 0 | 0 | abierto · QUEDA | P7-h · El paso de guardar y reabrir la miniatura de la CIA no se pudo medir |
| 14578 | 2 | 1439 | 0 | 0 | abierto · QUEDA | P7-i · `mitral-dibujo-estatico.md` sigue a 400 bytes del techo (sigue abierto `P6-h`) |
| 14599 | 2 | 548 | 0 | 0 | abierto · QUEDA | P7-j · La letra del dibujo del VD queda por debajo de 12 px, y es decisión del médico (cierra ` |
| 14607 | 2 | 1848 | 0 | 0 | abierto · QUEDA | P7-k · El PRIMER botón de `vd-triv` y de `pul-balik` mide 0 × 0, y ninguna sonda abre su conten |
| 14635 | 2 | 710 | 0 | 0 | abierto · QUEDA | Cierres de esta tanda |
| 14646 | 2 | 1037 | 0 | 0 | abierto · QUEDA | P8-a · El estado de los botones de TAVI no sobrevive a guardar y reabrir |
| 14663 | 2 | 730 | 0 | 0 | abierto · QUEDA | P8-b · El panel Post-TAVI queda MÁS ALTO a 1000 y a 900 px, y es aritmética |
| 14675 | 2 | 541 | 0 | 0 | abierto · QUEDA | P8-c · Barra horizontal a 900 y 899 px, PREEXISTENTE |
| 14685 | 2 | 1640 | 0 | 0 | abierto · QUEDA | P8-d · La morfología de TAVI y la de Válvulas NO comparten un solo valor |
| 14719 | 2 | 1572 | 0 | 0 | abierto · QUEDA | P8-e · La prótesis mitral sigue sin molde de Evidencia, ahora con DOS motivos medidos |
| 14740 | 2 | 673 | 0 | 0 | abierto · QUEDA | P8-f · La app tiene UN campo de tracto de salida del VD y la guía publica TRES |
| 14751 | 2 | 722 | 0 | 0 | abierto · QUEDA | P8-g · `_labUsaTavi` ya daba positivo en estudios sin TAVI, y es preexistente |
| 14763 | 2 | 1135 | 0 | 0 | abierto · QUEDA | P8-h · Tres inventarios con sus decisiones esperando |
| 14780 | 1 | 50 | — | — | contenedor · QUEDA | TANDA PANT-14c (2026-11-05/06) — lo declarado |
| 14782 | 2 | 2676 | 0 | 0 | abierto · QUEDA | P14c-a · El texto chico que NO cae claramente en ninguna de las dos listas |
| 14803 | 2 | 2181 | 0 | 0 | abierto · QUEDA | P14c-b · La apertura automática de secciones contradice «siempre cerradas», y se declara |
| 14836 | 2 | 1064 | 0 | 0 | abierto · QUEDA | P14c-c · El anillo de la obstrucción subaórtica aporta MENOS píxeles que antes, y es lo correct |
| 14859 | 2 | 1195 | 0 | 0 | abierto · QUEDA | P14c-d · Lo que esta tanda dejó sin tocar en la pestaña de transposición |
| 14877 | 2 | 1356 | 0 | 0 | abierto · QUEDA | P14c-e · A 390 px la sección de transposición queda MÁS ALTA, y es el precio de la agrupación |
| 14903 | 2 | 1717 | 0 | 0 | abierto · QUEDA | P14c-f · El `tga_bav` cambió de lugar en el marcado, y es el precio de agrupar por temas |
| 14934 | 2 | 1526 | 0 | 0 | abierto · QUEDA | P14c-g · `popHayDatos` no puede ver el valor de un campo `hidden`, y eso hace su exclusión redu |
| 14959 | 2 | 1139 | 0 | 0 | abierto · QUEDA | P14c-h · La regla de rótulos que no se solapan no se puede medir desde la suite |
| 14978 | 2 | 2406 | 0 | 0 | abierto · QUEDA | P14c-i · Lo que la tanda PANT-14c deja para las que siguen |
| 15014 | 1 | 69 | — | — | contenedor · QUEDA | TANDA PANT-18 (2026-11-06) — la prótesis aórtica, parte 1 de 5 |
| 15016 | 2 | 1213 | 0 | 0 | abierto · QUEDA | P18-a · El asterisco de la Tabla 5 NO alcanza a la fila del AT/ET |
| 15034 | 2 | 796 | 0 | 0 | abierto · QUEDA | P18-b · El informe puede publicar un AT/TE mayor o igual que 1 que la fila se niega a clasifica |
| 15047 | 2 | 692 | 0 | 0 | abierto · QUEDA | P18-c · El disparador de la nota del AT no se tocó, y ahora la nota habla también del AT/ET |
| 15059 | 2 | 715 | 0 | 0 | abierto · QUEDA | P18-d · Una TAVI normal no recibe el renglón de «prótesis normofuncionante» y una quirúrgica sí |
| 15071 | 2 | 451 | 0 | 0 | abierto · QUEDA | P18-e · A 768 y a 390 px el bloque `bloque-ea-detalle` está colapsado |
| 15079 | 2 | 705 | 0 | 0 | abierto · QUEDA | P18-f · El campo ET mide 27 px de alto y no 44 |
| 15092 | 2 | 676 | 0 | 0 | abierto · QUEDA | P18-g · Lo que la tanda PANT-18 deja para las que siguen |
| 15104 | 2 | 2627 | 0 | 0 | abierto · QUEDA | P19-a · Lo que la Tabla A4, la A1/A2 y la A3 NO imprimen como el índice decía |
| 15144 | 2 | 1439 | 0 | 0 | abierto · QUEDA | P19-b · Los bordes de la fila de la EOA de la Tabla 5 los resuelve la aplicación |
| 15169 | 2 | 753 | 0 | 0 | abierto · QUEDA | P19-f · La pantalla publica el mismo número con un cero final menos que la tabla |
| 15182 | 2 | 546 | 0 | 0 | abierto · QUEDA | P19-c · El PPM mitral SÍ usa los cortes mitrales — no hay nada que parar |
| 15190 | 2 | 1118 | 0 | 0 | abierto · QUEDA | P19-d · La Tabla A6 (SAPIEN mitral) no se carga, y es la condición del commit 6 |
| 15207 | 2 | 1283 | 0 | 0 | abierto · QUEDA | P19-g · La columna del Excel se llama «AVA de referencia aórtica» y no «AEO» |
| 15230 | 2 | 2175 | 0 | 0 | abierto · QUEDA | P19-e · El botón «Modelo y tamaño» no entra en la fila de morfología de la MITRAL |
| 15262 | 1 | 40 | — | — | contenedor · QUEDA | PANT-22 (2026-11-07) — lo declarado |
| 15264 | 2 | 2923 | 5 | 0 | abierto · QUEDA | P22-a — las cadenas que NO se pudieron reescribir sin contenido nuevo |
| 15312 | 2 | 700 | 0 | 0 | abierto · QUEDA | P22-b — sectores sin interruptor o con criterio distinto: NINGUNO |
| 15323 | 2 | 811 | 0 | 0 | abierto · QUEDA | Tres premisas de la orden que NO se reprodujeron |
| 15335 | 2 | 191 | 0 | 0 | abierto · QUEDA | Un intermitente PREEXISTENTE, caracterizado |
| 15340 | 2 | 826 | 0 | 0 | abierto · QUEDA | Lo que sigue — tanda 2 de la Evidencia |
| 15353 | 2 | 1906 | 1 | 0 | abierto · QUEDA | P22-a (continuación) — lo que el censo del commit 1 no vio, y lo que NO cae bajo la regla |

## (d) Clasificacion: lo que se archiva de docs/PENDIENTES.md, bloque por bloque

La evidencia de cierre esta **en el propio encabezado de cada bloque**, con su fecha y su
tanda o commit. No se archivo ni un bloque por parecerlo.

| lineas | nivel | bytes | encabezado con su evidencia |
|---|---|---:|---|
| 1475..1486 | nivel2 | 839 | P3-h · [CERRADO 2026-11-03] Los commits 6 a 10 de PANT-3 se hicieron |
| 1543..1561 | nivel2 | 1249 | P3-m · [CERRADO 2026-11-03 · PANT4-3] La app afirmaba que la resonancia es el estándar de referencia |
| 1603..1617 | nivel2 | 1116 | P3-q · [CERRADO 2026-11-03 · PANT3-12] La fila del TEP decía la sigla dos veces |
| 1618..1644 | nivel2 | 1675 | P3-r · [CERRADO 2026-11-03 · PANT4-7b] El estilo de informe es estado de sesión, y TC-502 no lo devolvía |
| 1667..1687 | nivel3 | 1414 | [CERRADO 2026-10-24 · AJ7-4a] J-a · Dos conductas siguen en el informe firmado de constricción y restricción |
| 1688..1703 | nivel3 | 1093 | [CERRADO 2026-10-24 · AJ7-4b] J-b · La Evidencia de constricción despierta sobre un estudio de taponamiento |
| 1935..1949 | nivel3 | 992 | ✅ Y3-7 · CERRADO el 2026-10-16 — las dos calculadoras del Wilkins SE UNIFICARON |
| 2006..2038 | nivel3 | 2469 | [CERRADO 2026-10-16 · Y1c] Y3-2 · La vista 2D del Y1b, en Safari y en Chrome |
| 2046..2059 | nivel3 | 1081 | ✅ Y3-4 · CERRADO el 2026-10-16 — el chorro severo ya no sale del cuadro |
| 2090..2100 | nivel3 | 857 | [CERRADO 2026-10-15 · W2-A] W1-1 · `calcTHP()` salía temprano sin llamar a `calcEM()` |
| 2127..2151 | nivel3 | 1948 | [CERRADO 2026-10-15 · W2-A] W1-2 · El Laboratorio contaba «Sin estenosis» lo que el informe llama «Gradiente elevado» |
| 2167..2185 | nivel3 | 1317 | [CERRADO 2026-10-15 · W2-B] W1-3 · El cuadro de referencias de la EM publica cortes NATIVOS sobre una prótesis |
| 2186..2200 | nivel3 | 981 | [CERRADO 2026-10-15 · W2-B] W1-4 · La fila del AVA del recuadro Doppler aórtico, con prótesis |
| 2201..2222 | nivel3 | 1514 | [CERRADO 2026-10-15 · W2-B, en pantalla] W1-5 · El PPM AÓRTICO no se calcula |
| 2223..2236 | nivel3 | 959 | [CERRADO 2026-10-15 · W2-B] W1-6 · Falta la banda intermedia del AEO protésico mitral |
| 2237..2258 | nivel3 | 1656 | [CERRADO 2026-10-15 · W2-A, en lo que la orden autorizaba] W1-7 · La continuidad mitral y el ritmo |
| 2276..2290 | nivel3 | 991 | [CERRADO 2026-10-15 · W2-B] W1-8 · El THP con rótulo nativo sobre una prótesis |
| 2291..2305 | nivel3 | 952 | [CERRADO 2026-10-15 · W2-B] W1-9 · La velocidad pico de E y el gradiente medio protésicos |
| 2306..2327 | nivel3 | 1581 | [CERRADO 2026-10-15 · W2-B] W1-10 · La atribución de la IM protésica |
| 2328..2348 | nivel3 | 1475 | [DECIDIDO 2026-10-15 · W2-B — el número NO se mueve] W1-11 · El jet/AI NATIVO usa `>40 %` |
| 2361..2370 | nivel3 | 824 | [CERRADO 2026-10-15 · Z] Z2 · El PPM AÓRTICO no entra en el informe firmado, y el MITRAL sí |
| 2415..2426 | nivel3 | 712 | [CERRADO 2026-10-15 · W2-B] W1-13 · `onchange` de `#va_morf` no recalcula |
| 2510..2529 | nivel3 | 1388 | [CERRADO 2026-10-15 · G1] D2-2 · `#vd-tei-aviso` tenía el mismo defecto de color |
| 2530..2551 | nivel3 | 1644 | [CERRADO 2026-10-15 · G2] D2-3 · El Excel conserva dos encabezados que dicen PHT |
| 2570..2583 | nivel3 | 1119 | ✅ [CERRADO 2026-10-14, D2] D1-1 · El aviso del selector de método de la IM dice `--amber` y se ve GRIS |
| 2584..2592 | nivel3 | 658 | ✅ [CERRADO 2026-10-14, D2] D1-2 · Los SIETE globos de legado muestran su texto viejo hasta D2 |
| 2593..2600 | nivel3 | 524 | ✅ [CERRADO 2026-10-14, D2] D1-3 · El `title` largo de la fila sigue existiendo en escritorio |
| 2781..2795 | nivel3 | 1256 | M2 · ✅ CERRADO el 2026-10-14 — `limpiarCampos` limpia las TRES fotos de proceso |
| 2818..2833 | nivel3 | 1431 | M5 · ✅ CERRADO el 2026-10-14 — las tres afirmaciones de la ayuda de la EM dicen la regla vigente |
| 2842..2852 | nivel3 | 801 | M7 · ✅ CERRADO el 2026-10-14 — gana la ASE 2023 y el operador pasa a `>=` |
| 2925..2938 | nivel3 | 945 | H1 · ✅ CERRADO el 2026-10-14 — el original ENTRÓ a la biblioteca y los cortes están verificados |
| 2939..2948 | nivel3 | 716 | H2 · ✅ CERRADO el 2026-10-14 — la PSAP > 35 mmHg vota |
| 2949..2962 | nivel3 | 809 | H3 · ✅ CERRADO PARCIALMENTE el 2026-10-14 — el IMVI mayor pasa a `>=`; el menor se queda en `>` |
| 3146..3158 | nivel3 | 909 | A-5 · ✅ **CERRADO 2026-10-13** — El criterio «VTI de entrada tricuspídeo >60 cm» ya vota |
| 3275..3293 | nivel3 | 1409 | B-9 · ✅ CERRADO el 2026-10-14 — el renglón «Severidad (continuidad)» se vacía |
| 3408..3423 | nivel3 | 1256 | C1 · El importador sigue rechazando un LARS negativo que la pantalla ya no marca — ✅ **CERRADO 2026-10-14** |
| 3424..3437 | nivel3 | 919 | C2 · La nota ‡ de la Figura 3 y el inciso (d) no dicen lo mismo — ✅ **CERRADO 17/10/2026 (CORTOS6)** |
| 3516..3530 | nivel3 | 1138 | A1 · ✅ **CERRADO 2026-10-12** — El E/e′ con un solo anillo se compara contra el corte del PROMEDIO |
| 3546..3557 | nivel3 | 872 | A4 · ✅ **CERRADO EN PARTE 2026-10-12** — Un `null` del Laboratorio cuenta como «Sin disfunción» en el Excel |
| 3558..3565 | nivel3 | 500 | A5 · ✅ **CERRADO 2026-10-12** — La frase de la 8A no tiene token en el Laboratorio |
| 3591..3603 | nivel3 | 941 | V1 · Las filas de TAPSE y S′ del cuadro no vuelven a «—» al borrar el dato — ✅ **CERRADO 18/10/2026 (ARR2)** |
| 3696..3707 | nivel3 | 787 | ✅ B1 — CERRADO el 2026-10-12. El LAPs y la onda L YA tienen campo |
| 3809..3823 | nivel3 | 1021 | 1 · [CERRADO 2026-10-12] El cuadro gris se atrasaba: `calcDiastol` no estaba cableado |
| 3881..3914 | nivel3 | 2803 | 7 · [CERRADO 2026-10-12] Con «ASE 2025» y FA se graduaba con la vía SINUSAL de la BSE |
| 4315..4388 | nivel2 | 5866 | ✅ CERRADO 2026-10-03 — la aórtica entró, y por una tercera salida |
| 4813..4835 | nivel3 | 1475 | G1-2 · ✅ **CERRADO el 21/10/2026 (tanda C, commit 1)** — el 0,32 salió de la pantalla de TEP |
| 4871..4894 | nivel3 | 1698 | [CERRADO POR RETIRO 2026-10-15 · Z] G1-6 · El 0,36 en insuficiencia cardíaca NO está verificado al estándar de la casa |
| 4928..4948 | nivel3 | 1529 | [CERRADO 2026-10-15 · G2] G1-10 · El diámetro de la arteria pulmonar no tiene columna de Excel |
| 5007..5023 | nivel3 | 1175 | G2-2 · [CERRADO 2026-10-15 · G3] El mensaje del importador para el cociente es el de «campo no editable», no el de «calculado» |
| 5024..5041 | nivel3 | 1271 | G2-3 · [CERRADO 2026-10-15 · G3] El PPT estadístico y la mini-tabla del PDF de auditoría siguen sin contar la tricúspide binaria |
| 5078..5102 | nivel3 | 1637 | [CERRADO 2026-10-15 · Z] G3-1 · La ida y vuelta del TAPSE/PSAP no se reproducía: la velocidad de la IT no tenía columna |
| 5198..5206 | nivel3 | 713 | [CERRADA 2026-10-15 · Z5, opción (b)] Z2-1 · La línea del PPM aórtico dice «aórtico» y la del mitral no nombra su válvula |
| 5207..5218 | nivel3 | 937 | [CERRADA 2026-10-15 · Z5] Z2-2 · La fila de pantalla del PPM aórtico se queda en «requiere …» con el veredicto calculado |
| 5219..5231 | nivel3 | 1077 | [CERRADA 2026-10-15 · Z5, salida (a)] Z3-1 · El renglón integrado etiqueta por el AVA por continuidad y nombra el criterio GLOBAL |
| 5253..5298 | nivel3 | 2994 | Z4-TEP · ✅ **CERRADO el 21/10/2026 (tanda C, commit 1)** — el 0,32 salió de todo veredicto |
| 5451..5457 | nivel3 | 442 | ✅ [CERRADO 2026-10-16 · Y2] Y1-1 · El «por qué» de cada tarjeta es el Y2 y no está |
| 5869..5888 | nivel3 | 1460 | Y3b-5 · La fórmula de Balik — ✅ **CERRADO 17/10/2026 (CORTOS13): TIENE FUENTE** |
| 5941..5956 | nivel3 | 834 | J-2 · El PDF de amiloidosis imprimía sólo el documento — ✅ **CERRADO 17/10/2026 (CORTOS9)** |
| 6048..6060 | nivel3 | 805 | K-3 · Los otros dos toggles de PDF estaban en `localStorage` — ✅ **CERRADO 17/10/2026 (CORTOS9)** |
| 6237..6252 | nivel3 | 1052 | L-9 · [CERRADO 2026-10-18, tanda P] No hay botón «Ver referencia» en la tarjeta |
| 6336..6347 | nivel3 | 813 | M-11 · [CERRADO 2026-10-18, tanda P] No hay botón «Ver referencia» en las tarjetas nuevas |
| 6407..6425 | nivel3 | 1215 | LS-5 · El aviso del importador del diámetro AP no miraba el sexo — ✅ **CERRADO 17/10/2026 (CORTOS8)** |
| 6426..6443 | nivel3 | 1200 | LS-6 · `FEVICAT` pasó de tres clases a cuatro — ✅ **CERRADO 17/10/2026 (CORTOS7)** |
| 6444..6460 | nivel3 | 1184 | LS-7 · Dos lugares usaban un 40 pelado — ✅ **CERRADO 17/10/2026 (CORTOS7)** |
| 6467..6479 | nivel3 | 734 | LS-9 · El enlace del aviso a 768 px — ✅ **CERRADO 17/10/2026 (CORTOS8): NO ERA UN DEFECTO** |
| 6480..6503 | nivel3 | 1325 | LS-10 · El aviso de sexo de las tarjetas vivía en DOS constantes — ✅ **CERRADO 17/10/2026 (CORTOS8)** |
| 6509..6524 | nivel3 | 1190 | ✅ Cerrados por esta tanda |
| 6667..6711 | nivel3 | 3391 | PRO-1 · La FUGA PARAVALVULAR de la prótesis QUIRÚRGICA — **CERRADO 17/10/2026 (tanda PRO-B)** |
| 6712..6755 | nivel3 | 3105 | PRO-2 · Las prótesis TRICÚSPIDE y PULMONAR siguen sin graduar — **CERRADO 17/10/2026 (tanda PRO-C)** |
| 6795..6804 | nivel3 | 554 | PRO-6 · El mapa de prótesis quedó a 754 bytes del techo — **CERRADO 17/10/2026 (PRO-B1)** |
| 6895..6909 | nivel3 | 928 | PRO-C4 · Dos rótulos de la IP describían la válvula NATIVA — ✅ **CERRADO 17/10/2026 (CORTOS5)** |
| 6942..6958 | nivel3 | 1219 | CORTOS-1 · El test de burbuja tiene DOS escalas en la app — ✅ **CERRADO 18/10/2026 (ARR8), por la salida (a)** |
| 6980..6987 | nivel3 | 531 | CORTOS-5 · El Ar−A tenía DOS constantes con dos operadores — ✅ **CERRADO 18/10/2026 (ARR5)** |
| 7071..7088 | nivel3 | 1225 | Q-4 · [CERRADO 2026-10-18, tanda P] No hay botón «Ver referencia» en las nueve tarjetas nuevas (es `L-9` y `M-11`, otra vez) |
| 7161..7174 | nivel3 | 1158 | ARR-5 · [CERRADO 2026-10-22 por el trabajo D] La indicación de cierre del FOP según la edad |
| 7189..7203 | nivel3 | 1249 | ARR-8 · [CERRADO 2026-10-22 por el trabajo D] El informe esquemático del FOP alcanzaba a seis de las diez claves |
| 7291..7312 | nivel3 | 1419 | [CERRADO 2026-10-20 · Y3e2] Y3d-1 · La orientación de la vista TRANSGÁSTRICA no coincidía con la guía |
| 7331..7346 | nivel3 | 1111 | [CERRADO 2026-10-21 · trabajo H] Y3d-4 · El «hasta el 85 %» de la coartación se retiró y no se reemplazó |
| 7347..7357 | nivel3 | 857 | [CERRADO 2026-10-20 · Y3e3] Y3d-5 · «Senos asimétricos» no estaba definido en ninguna fuente |
| 7373..7383 | nivel3 | 535 | [CERRADO 2026-10-20 · Y3e4] Y3d-7 · `tests-fichas.md` quedó en 28,9 KB |
| 7386..7401 | nivel3 | 1176 | ✅ [CERRADO 2026-10-20, tanda Y3f6] Y3e-1 · El PDF sigue diciendo «fused type» en la hoja de cardiopatías congénitas |
| 7402..7415 | nivel3 | 1070 | ✅ [CERRADO 2026-10-20, tanda Y3f7] Y3e-2 · El aria-label del dibujo de la VAB no nombra la simetría, así que no hubo nada que renombrar |
| 7516..7531 | nivel3 | 1113 | R2-1 · [CERRADO 2026-10-22, tanda E] El informe callaba con la VRT «no medible» y cero categorías |
| 8174..8199 | nivel3 | 1496 | D2b-9 · Seis comentarios de `index.html` de esta tanda llevan la fecha equivocada — **CERRADO el 2026-10-21 (D3)** |
| 8954..8976 | nivel3 | 1415 | [CERRADO 2026-10-24 · AJ7-3h] AJ5-d · El strain del VD no vota, así que puede quedar «conservada» con el strain alterado |
| 8977..9011 | nivel3 | 2291 | [CERRADO 2026-10-24 · AJ7-3i] AJ5-e · La banda «leve 15-20 %» del strain NO estaba en el AJ1, y no está declarada en Referencias |
| 9012..9031 | nivel3 | 1181 | [CERRADO 2026-10-24 · AJ7-3j] AJ5-f · Qué hace la PANTALLA con el Tipo de IM y el Carpentier sobre una prótesis |
| 9032..9064 | nivel3 | 2058 | [CERRADO 2026-10-24 · AJ7-3k] AJ5-g · «Mixomatosa / Barlow» se recorta 6 px en el control cerrado, y las tres exigencias de la orden no son simultánea |
| 9112..9139 | nivel3 | 2000 | [CERRADO 2026-10-24 · AJ7-1a] AJ6-a · El EN SUMA repite la insuficiencia y la estenosis pulmonar que la sección de válvulas ya publicó |
| 9140..9163 | nivel3 | 1663 | [CERRADO 2026-10-24 · AJ7-1b] AJ6-b · La hoja del PDF de Fallot sigue publicando la conducta, y el informe ya no |
| 9260..9281 | nivel3 | 1341 | [CERRADO 2026-10-24 · AJ7-5] J2-a · «Reevaluar en 3-6 sem» en la fila anti-HER2 no tiene fuente, y sigue en pantalla |
| 9359..9389 | nivel3 | 1959 | [CERRADO 2026-10-24 · AJ7-6a] J2-f · Un hallazgo ALTA más en el celular: el ⓘ del score es el decimoquinto `.vinfo-btn` |
| 10490..10572 | nivel2 | 4150 | D-r · [CERRADO 2026-10-28] La suite completa del D-11 — retomada y cerrada |

**93 bloques, 124362 bytes** de los 1007449 del archivo (12.3 %).

### Lo que NO se archiva aunque este cerrado, y por que (va a `L1-a`)

**24 ids** aparecen en el archivo **dos o tres veces** —una como item y otra en una entrada
posterior que lo cierra—, y de esas al menos una aparicion esta fuera de lo archivable. Para
que un `grep` de un id no devuelva dos archivos, **todas** las apariciones de esos ids se
quedan en `docs/PENDIENTES.md`:

`AJ3-b`, `AJ3-c`, `AJ3-d`, `D-4`, `D-6`, `G-a`, `G-c`, `G-e`, `H-1`, `H-2`, `IMG3-a`, `IMG3-g`, `L-1`, `L-2`, `L-3`, `L-4`, `L-5`, `P13-c`, `PRO-4`, `TGA2-b`, `Y-g`, `Z5-1`, `Z5-3`, `Z5-5`

### Lo que queda abierto, medido

| clase | bloques de nivel 2 | bytes |
|---|---:|---:|
| abiertos, sin una sola marca de cierre | 418 | 574170 |
| mezclados (quedan; se archivan sus sub-items cerrados) | 41 | 321248 |
| cerrados enteros (se archivan) | 10 | 18893 |

⚠️ **La premisa de que `docs/PENDIENTES.md` es mayormente historia cerrada NO se reproduce.**
Con el criterio de la orden —solo el item cuyo propio texto, o uno posterior, diga que esta
cerrado, con tanda o commit— lo archivable es el **12.3 %** del archivo. Las 41 secciones de
nivel 1 se titulan «lo declarado y NO tocado» y sus items **no** dicen que esten cerrados:
por la regla de oro quedan en el original, y decidir si siguen vivos es del medico.

## (e) Tamanos DESPUES, estimados

| archivo | bytes antes | bytes despues | tokens despues | delta |
|---|---:|---:|---:|---:|
| `CLAUDE.md` | 880308 | 143565 | 35891 | −736743 (−83.7 %) |
| `docs/PENDIENTES.md` | 1007449 | 883087 | 220771 | −124362 (−12.3 %) |
| `docs/archivo/CLAUDE_HISTORIAL_TANDAS.md` | — | 736740 | 184185 | nuevo |
| `docs/archivo/PENDIENTES_CERRADOS.md` | — | 124362 | 31090 | nuevo |

Los numeros de «despues» son los bytes de los bloques movidos; el archivo final suma ademas
su indice, que son unas decenas de lineas. **Lo que Code carga al arrancar pasa de 1887757 a 1026652
bytes, de unos 471939 a unos 256663 tokens.**

## MANIFIESTO — bloque, destino y lineas originales

Es la particion completa de los dos archivos: **cada linea del original aparece en
exactamente un renglon**. Con esto se reconstruye cada original concatenando los rangos en
orden y se compara el md5 contra `git show HEAD:<archivo>`. Las lineas que los commits 2 y 3
agregan —indice y marcas de contexto— van entre `<!-- L1:INDICE -->` y `<!-- /L1:INDICE -->`
y se excluyen de esa comparacion.

```l1-manifiesto
# origen | lineas | destino
CLAUDE.md md5=493be3f414e67718e87de544fd92af67 lineas=10628
CLAUDE.md | 1-1407 | CLAUDE.md
CLAUDE.md | 1408-6447 | docs/archivo/CLAUDE_HISTORIAL_TANDAS.md
CLAUDE.md | 6448-6484 | CLAUDE.md
CLAUDE.md | 6485-10628 | docs/archivo/CLAUDE_HISTORIAL_TANDAS.md
docs/PENDIENTES.md md5=68effc8a492a2d51332797f0b279c62a lineas=15374
docs/PENDIENTES.md | 1-1474 | docs/PENDIENTES.md
docs/PENDIENTES.md | 1475-1486 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 1487-1542 | docs/PENDIENTES.md
docs/PENDIENTES.md | 1543-1561 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 1562-1602 | docs/PENDIENTES.md
docs/PENDIENTES.md | 1603-1617 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 1618-1644 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 1645-1666 | docs/PENDIENTES.md
docs/PENDIENTES.md | 1667-1687 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 1688-1703 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 1704-1934 | docs/PENDIENTES.md
docs/PENDIENTES.md | 1935-1949 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 1950-2005 | docs/PENDIENTES.md
docs/PENDIENTES.md | 2006-2038 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 2039-2045 | docs/PENDIENTES.md
docs/PENDIENTES.md | 2046-2059 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 2060-2089 | docs/PENDIENTES.md
docs/PENDIENTES.md | 2090-2100 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 2101-2126 | docs/PENDIENTES.md
docs/PENDIENTES.md | 2127-2151 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 2152-2166 | docs/PENDIENTES.md
docs/PENDIENTES.md | 2167-2185 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 2186-2200 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 2201-2222 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 2223-2236 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 2237-2258 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 2259-2275 | docs/PENDIENTES.md
docs/PENDIENTES.md | 2276-2290 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 2291-2305 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 2306-2327 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 2328-2348 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 2349-2360 | docs/PENDIENTES.md
docs/PENDIENTES.md | 2361-2370 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 2371-2414 | docs/PENDIENTES.md
docs/PENDIENTES.md | 2415-2426 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 2427-2509 | docs/PENDIENTES.md
docs/PENDIENTES.md | 2510-2529 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 2530-2551 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 2552-2569 | docs/PENDIENTES.md
docs/PENDIENTES.md | 2570-2583 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 2584-2592 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 2593-2600 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 2601-2780 | docs/PENDIENTES.md
docs/PENDIENTES.md | 2781-2795 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 2796-2817 | docs/PENDIENTES.md
docs/PENDIENTES.md | 2818-2833 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 2834-2841 | docs/PENDIENTES.md
docs/PENDIENTES.md | 2842-2852 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 2853-2924 | docs/PENDIENTES.md
docs/PENDIENTES.md | 2925-2938 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 2939-2948 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 2949-2962 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 2963-3145 | docs/PENDIENTES.md
docs/PENDIENTES.md | 3146-3158 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 3159-3274 | docs/PENDIENTES.md
docs/PENDIENTES.md | 3275-3293 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 3294-3407 | docs/PENDIENTES.md
docs/PENDIENTES.md | 3408-3423 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 3424-3437 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 3438-3515 | docs/PENDIENTES.md
docs/PENDIENTES.md | 3516-3530 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 3531-3545 | docs/PENDIENTES.md
docs/PENDIENTES.md | 3546-3557 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 3558-3565 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 3566-3590 | docs/PENDIENTES.md
docs/PENDIENTES.md | 3591-3603 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 3604-3695 | docs/PENDIENTES.md
docs/PENDIENTES.md | 3696-3707 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 3708-3808 | docs/PENDIENTES.md
docs/PENDIENTES.md | 3809-3823 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 3824-3880 | docs/PENDIENTES.md
docs/PENDIENTES.md | 3881-3914 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 3915-4314 | docs/PENDIENTES.md
docs/PENDIENTES.md | 4315-4388 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 4389-4812 | docs/PENDIENTES.md
docs/PENDIENTES.md | 4813-4835 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 4836-4870 | docs/PENDIENTES.md
docs/PENDIENTES.md | 4871-4894 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 4895-4927 | docs/PENDIENTES.md
docs/PENDIENTES.md | 4928-4948 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 4949-5006 | docs/PENDIENTES.md
docs/PENDIENTES.md | 5007-5023 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 5024-5041 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 5042-5077 | docs/PENDIENTES.md
docs/PENDIENTES.md | 5078-5102 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 5103-5197 | docs/PENDIENTES.md
docs/PENDIENTES.md | 5198-5206 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 5207-5218 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 5219-5231 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 5232-5252 | docs/PENDIENTES.md
docs/PENDIENTES.md | 5253-5298 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 5299-5450 | docs/PENDIENTES.md
docs/PENDIENTES.md | 5451-5457 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 5458-5868 | docs/PENDIENTES.md
docs/PENDIENTES.md | 5869-5888 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 5889-5940 | docs/PENDIENTES.md
docs/PENDIENTES.md | 5941-5956 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 5957-6047 | docs/PENDIENTES.md
docs/PENDIENTES.md | 6048-6060 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 6061-6236 | docs/PENDIENTES.md
docs/PENDIENTES.md | 6237-6252 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 6253-6335 | docs/PENDIENTES.md
docs/PENDIENTES.md | 6336-6347 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 6348-6406 | docs/PENDIENTES.md
docs/PENDIENTES.md | 6407-6425 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 6426-6443 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 6444-6460 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 6461-6466 | docs/PENDIENTES.md
docs/PENDIENTES.md | 6467-6479 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 6480-6503 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 6504-6508 | docs/PENDIENTES.md
docs/PENDIENTES.md | 6509-6524 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 6525-6666 | docs/PENDIENTES.md
docs/PENDIENTES.md | 6667-6711 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 6712-6755 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 6756-6794 | docs/PENDIENTES.md
docs/PENDIENTES.md | 6795-6804 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 6805-6894 | docs/PENDIENTES.md
docs/PENDIENTES.md | 6895-6909 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 6910-6941 | docs/PENDIENTES.md
docs/PENDIENTES.md | 6942-6958 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 6959-6979 | docs/PENDIENTES.md
docs/PENDIENTES.md | 6980-6987 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 6988-7070 | docs/PENDIENTES.md
docs/PENDIENTES.md | 7071-7088 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 7089-7160 | docs/PENDIENTES.md
docs/PENDIENTES.md | 7161-7174 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 7175-7188 | docs/PENDIENTES.md
docs/PENDIENTES.md | 7189-7203 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 7204-7290 | docs/PENDIENTES.md
docs/PENDIENTES.md | 7291-7312 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 7313-7330 | docs/PENDIENTES.md
docs/PENDIENTES.md | 7331-7346 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 7347-7357 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 7358-7372 | docs/PENDIENTES.md
docs/PENDIENTES.md | 7373-7383 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 7384-7385 | docs/PENDIENTES.md
docs/PENDIENTES.md | 7386-7401 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 7402-7415 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 7416-7515 | docs/PENDIENTES.md
docs/PENDIENTES.md | 7516-7531 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 7532-8173 | docs/PENDIENTES.md
docs/PENDIENTES.md | 8174-8199 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 8200-8953 | docs/PENDIENTES.md
docs/PENDIENTES.md | 8954-8976 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 8977-9011 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 9012-9031 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 9032-9064 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 9065-9111 | docs/PENDIENTES.md
docs/PENDIENTES.md | 9112-9139 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 9140-9163 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 9164-9259 | docs/PENDIENTES.md
docs/PENDIENTES.md | 9260-9281 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 9282-9358 | docs/PENDIENTES.md
docs/PENDIENTES.md | 9359-9389 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 9390-10489 | docs/PENDIENTES.md
docs/PENDIENTES.md | 10490-10572 | docs/archivo/PENDIENTES_CERRADOS.md
docs/PENDIENTES.md | 10573-15374 | docs/PENDIENTES.md
```

El numero de **ids de item** —el identificador al principio de un encabezado de nivel 2 o 3—
en el original es **856 distintos en 908 apariciones**. Despues del reparto la suma de los dos
archivos tiene que dar los mismos 856, y ningun id puede aparecer en los dos.
