# Fichas de los casos TC-686 a TC-692 — tanda PANT-13

> Archivo propio, porque `tests-fichas.md` está en **34.237 B**, a menos de 1 KB del techo
> (→ `docs/PENDIENTES.md` → **P13-e**).
>
> Los **siete** caen contra la base de la tanda (`866482f`) por **124 condiciones y NINGUNA por
> excepción**, verificado en un worktree alternando sólo `index.html` con el **mismo** archivo de
> casos.

| Caso | Commit | Condiciones rojas contra la base |
|---|---|---|
| TC-686 | 1 · el lienzo y las tildes | 14 |
| TC-687 | 2 · «Explorar» en tres zonas | 29 |
| TC-688 | 3 · «Incluir en el PDF» del módulo | 22 |
| TC-689 | 4 · la transposición como sexta base | 20 |
| TC-690 | 5 · la tabla de masas y los textos neutros | 16 |
| TC-691 | 6 · el broncograma en puntitos | 13 |
| TC-692 | 7 · las variantes en grilla compacta | 10 |

---

## TC-686 · El lienzo sigue al ancho de su recuadro, y las tildes

**Denominadores.** (A0) el estado del módulo es alcanzable; (B2) el ancho del recuadro **cambia de
verdad** —el caso lo fuerza, porque el arnés corre Chrome a ~756 px y sin eso el ancho no se mueve
y la condición no puede fallar—.

**Controles negativos.** (B4) sin que el ancho cambie, el lienzo **no** se rehace: así se distingue
«sigue al ancho» de «se rehace siempre». (C3) la sonda de tildes sabe encontrar una palabra sin
tilde, sembrada a mano.

⚠️ **«pulmon» EMPAREJA CON «pulmonar», y costó una corrida.** El censo de tildes pasó a pedir
palabra completa: sin eso, «arteria pulmonar» salía marcada como «pulmón sin tilde».

## TC-687 · «Explorar» en tres zonas, las combinaciones y el esquema

**Denominadores.** (A0) el estado es alcanzable; el caso entra a «Explorar» por su botón real antes
de medir, porque las dos listas laterales están `hidden` en «Según el estudio».

**Controles negativos.** (A4) la tabla lateral de PANT-12 y sus filas **ya no existen**: si
siguieran, la zona derecha mediría lo mismo por otro motivo. (E3) el esquema **no** dibuja siempre
lo mismo: con Eisenmenger la corriente se invierte, y sin él no. (F1) el movimiento reducido y la
pausa son los **del módulo** y no un reloj propio.

## TC-688 · «Incluir en el PDF» del corazón maestro

**Denominadores.** (A3) el estudio tiene algo cargado —sin eso el botón está apagado *pase lo que
pase* y ninguna condición puede fallar—; (E0) la línea del PDF describe lo cargado; (G0) ahora sí
hay algo cargado, para la rama de la transposición.

**Controles negativos.** (C1) a (C3) en «Explorar» queda apagado **y al volver se habilita otra
vez**; (F1) a (F3) sin nada cargado queda apagado y lo dice; (G1) a (G3) con una transposición
cargada queda apagado **y el gesto también lo respeta, no sólo el pintor** —son dos caminos y
romper uno lo tapa el otro—; (A2) el botón **no** es campo del estudio.

⚠️ **(E2) ES LA CONDICIÓN QUE MÁS DICE**: el PDF lleva la versión **del estudio** aunque se esté
explorando otra cosa. Sin ella, un médico que explora una combinación didáctica y toca el botón se
lleva esa combinación al informe firmado.

## TC-689 · La transposición como sexta anatomía de base

**Denominadores.** (A0) el estado es alcanzable; (H0) la línea de abajo se escribió.

**Controles negativos.** (E6) sobre el corazón normal **no** se apaga ninguna de las diez lesiones
—así se distingue «las reglas de la TGA apagan» de «el bloqueador apaga siempre»—; (F0) con d-TGA
la CIA **sí** se puede elegir, y (F1) con el switch auricular **no**; (I1) a (I3) el recuadro de la
pestaña **sigue** en su sección, que es el guardián de la parada de **P13-c**.

⚠️ **CONTRA LA BASE, `cmSetBase('tga')` REVIENTA DENTRO DEL MOTOR** —allí «tga» no es una
anatomía—, así que la llamada va en un `try`: un caso que cae por excepción no dice qué invariante
se rompió. Es la lección de TC-546.

## TC-690 · La tabla de Masas cerrada y los textos neutros

**Denominadores.** (A0) la sección de Masas se abre —sin eso **todo su árbol informa 0 px**, que es
un denominador vacío—; (C0) la tabla tiene filas que contar.

**Controles negativos.** (E2) el censo **sabe** encontrar una frase que juzga una guía: se siembra
un centinela a mano, se cuenta y se retira, y (E3) comprueba que se retiró, así que (E1) sigue
valiendo. (B3) abrir la ayuda **no** cierra la tabla, que es por lo que el globo queda **fuera** del
botón. (F1) la tabla no agrega ningún campo guardado.

⚠️ **(A6) NO TIENE MUTACIÓN POSIBLE**, y se declara en **P13-f**: un botón dentro de otro es marcado
inválido y el navegador lo reparenta fuera, así que la mutación no inyecta nada.

## TC-691 · El broncograma en puntitos y el botón del PDF del pulmón

**Denominadores.** (A0) el diagrama existe; (B0) con consolidación hay un grupo recortado donde van
los puntos; (C3) el botón arranca apagado; (E0) queda encendido antes de vaciar.

**Controles negativos.** (B4) sin broncograma **no se dibuja un solo punto**; (D4) al tocarlo otra
vez se apaga y no queda nada que estampar; (E1) «Nuevo estudio» lo vacía, así que no se filtra al
paciente siguiente.

⚠️ **LOS IDS SON `pua_consol`, `pua_consol_lado` y `pua_consol_bronco`, Y EL DISPARADOR ES
`pulAvUI`.** La primera versión usaba nombres inventados y el denominador (B0) daba `false`: el
grupo de los puntos no existía porque **sin lado la mancha no se dibuja**.

## TC-692 · Las variantes anatómicas en grilla compacta

**Denominadores.** (A0) la sección de variantes se abre; (B0) las **seis** cajas de detalle existen.

**Controles negativos.** (E1) las notas del **aneurisma del septum** y de la **circunfleja
retroaórtica** **no** se esconden —son del mismo registro y no son variantes: ahí estuvo el defecto
que **TC-499 (g6)** cazó—; (C1) un estudio viejo con el detalle cargado y la casilla apagada lo
**sigue mostrando**; (B5) el valor **no** se borró, porque la función sólo muestra y esconde;
(B6) vaciado el texto con la casilla apagada, se vuelve a esconder.

⚠️ **LAS REGLAS DE CSS SE LEEN DEL TEXTO DE LOS `<style>`** y no de `document.styleSheets`, que en
este arnés devuelve vacío. Es la lección de PANT-7.
