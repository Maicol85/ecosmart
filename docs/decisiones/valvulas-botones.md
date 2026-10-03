<!-- Decisión de Maicol, 03/10/2026. El reglamento se guarda TEXTUALMENTE: es la fuente de
     verdad contra la que se audita, no un resumen. Lo que viene después es la medición. -->

# Botones, pastillas y grado de las válvulas — reglamento y auditoría

## 1. El reglamento (cerrado por Maicol, 03/10/2026) — texto literal

1. Botón prendido = «hay valvulopatía».
2. La pastilla muestra el grado y sigue sola al cálculo; sin cálculo dice «Severidad».
3. El select «grado final al informe» es lo que sale en el informe; con el botón prendido y sin
   grado muestra «Estenosis» o «Insuficiencia» (sin grado); el médico siempre lo corrobora.
4. El cálculo usa el criterio de cada válvula (estenosis aórtica: el peor de los disponibles).
5. Grado a mano: se mantiene mientras no cambie el grado calculado; si cambia, vuelve a automático.
6. Si lo elegido difiere del cálculo (más o menos): aviso rojo y cajón «Fundamento del ajuste»; el
   motivo va al informe junto al grado.
7. «Sin» = no hay valvulopatía: apaga el botón; si el cálculo dice otra cosa, aviso rojo y cajón
   visibles aunque el botón esté apagado.
8. Apagar el botón (con «Sin» o a mano) apaga el grado: vuelve a «Severidad» y se borran grado y
   fundamento, sin aviso previo; si el cálculo indica otra cosa, aviso rojo y cajón.
9. Botón prendido sin grado: el informe dice «con estenosis» o «con insuficiencia»; el EN SUMA la
   sigla más «presente» (EAo presente, IM presente…).
10. El informe usa el grado final y no el estado del botón, salvo la regla 9.
11. EN SUMA: siempre siglas (EAo, IAo, EM, IM, ET, IT, EP, IP), con grado («EAo severa»), las leves
    incluidas y las frases cortas del fundamento; «Otro» y las notas no van; las frases largas van
    solo en el informe narrativo.
12. Borrar un dato no retira el grado.
13. «Mixta» nunca se escribe sola: se listan las dos lesiones.
14. Excepciones: «Esclerosis» no abre cajón; EM sin clasificar no discrepa; prótesis mitral en
    silencio.
15. Tricúspide y pulmonar siguen el mismo modelo y formato (la pulmonar hoy no tiene botones ni
    pastillas; sin cálculo propio no hay aviso rojo).
16. Nada de esto cambia cortes ni fórmulas.

---

## 2. Qué se auditó y cómo

Auditoría **de solo lectura** del 2026-10-03. No se modificó `index.html`, ni la suite, ni el
exportador. Verificado: `md5` de `index.html` igual antes y después, y `git diff` vacío.

Sonda: `scripts/auditoria_botones.mjs` (reutilizable, `--solo <REGLA>`, `--valv <válvula>`,
`--ver`). Entra por **gestos reales de interfaz** vía el dominio `Input` de CDP:

| Gesto | Cómo se hace en la sonda |
|---|---|
| Clic en el botón de la válvula | `Input.dispatchMouseEvent` sobre el centro de `#pill-<tipo>-<valv>` |
| Elección en el menú ▼ | clic real en `#sevbtn-<tipo>-<valv>` y después clic real en el `<button role=menuitem>` del menú, buscado **por su texto** |
| Tipeo de un dato | `focus` + `Input.insertText` + `change`, carácter a carácter por el campo real |
| Elección en el desplegable de grado final | `change` real sobre el `<select>` ya enfocado |
| Estilo de informe | clic real en `.estilo-pill[data-estilo]` |
| Guardar / reabrir / Nuevo estudio | `guardarInforme`, `cargarEstudioPorId`, `limpiarCampos` — las funciones que los botones invocan |

**Límite declarado, no disimulado:** la lista desplegada de un `<select>` nativo la dibuja el
sistema operativo y **no es DOM**, así que no se puede clickear por CDP. Para la regla 3 y la 5 el
gesto se emite como un `change` real sobre el `<select>` enfocado, que es el evento exacto que
produce el navegador cuando el médico elige una opción. Es el único gesto de esta auditoría que no
es un clic de mouse.

**Denominador, verificado en cada escena y no una sola vez al arrancar.** La pestaña Válvulas y el
acordeón de cada válvula arrancan cerrados, y `limpiarCampos` los vuelve a cerrar; una sonda que
arma el denominador al inicio mide geometría cero en todas las escenas posteriores y el informe sale
«impecable». Cada escena repone `showTab('valvulas')` + las cuatro secciones **después** de limpiar,
y la foto registra `den.tab` y `den.secciones` (tiene que ser 4). Las escenas con `den` incompleto
se reportan como **NO MEDIBLE**, no como PASA.

**Control negativo por regla.** Cada regla trae un escenario donde el comportamiento **no** debe
aparecer. Sin eso una sonda que dice «sí» a todo es indistinguible de una que mide.

---

## 3. Hallazgo estructural que explica la mitad de la tabla

`SEV_SINC` —el registro que gobierna pastilla, aviso rojo, cajón del fundamento, `calculables`,
`comparables`, `bloqueado()`, `recalcular()` y la frase del motivo en el informe— tiene **cuatro
entradas**: `ea`, `ia`, `em`, `im`. Medido en el DOM:

| Lesión | Entrada en `SEV_SINC` | Botón `#pill-*` | Sub-botón ▼ `#sevbtn-*` | Aviso rojo | Cajón de fundamento |
|---|---|---|---|---|---|
| EAo / IAo | sí | sí | sí | `ea-manual-aviso` / `ia-manual-aviso` | `ea-fund` / `ia-fund` |
| EM / IM | sí | sí | sí | `em-manual-aviso` / `im-manual-aviso` | `em-fund` / `im-fund` |
| ET / IT | **no** | sí | sí | **no existe** | **no existe** |
| EP / IP | **no** | **no existe** | **no existe** | **no existe** | **no existe** |

O sea: las reglas 6, 7 y 8 no tienen dónde apoyarse en la tricúspide, y la 1, 2, 3, 6, 7 y 8 no
tienen dónde apoyarse en la pulmonar. No es un defecto de cableado que se arregle con una línea: son
entradas de registro que no existen.

### 3.1 Dos premisas que la medición corrigió

- **El prompt decía «árbol limpio, `main == origin/main`».** Medido: `origin/main` está en `42a1f0e`
  y `HEAD` en `5e1fd42` — **cuatro commits sin pushear**. Es el mismo renglón que el `CLAUDE.md` ya
  se equivocó una vez por copiarlo sin mirar.
- **La regla 15 dice de la pulmonar «sin cálculo propio no hay aviso rojo». La pulmonar SÍ tiene
  cálculo propio.** Con `vp_vmax` 4,5 m/s, `vp-sev-badge` publica literalmente: «Sugerido
  automáticamente por Vmax 4.5 m/s → Gmax 81 mmHg. Podés cambiarlo manualmente si lo creés
  necesario. El auto-grado sólo alcanza Leve, Moderada o Severa: "Moderada-severa" es elección
  manual.» y `ep_grado` queda en «Severa». Lo que le falta a la pulmonar es el **botón y la
  pastilla**, no el cálculo — así que la premisa que justificaba no tener aviso rojo no se sostiene
  para la estenosis. (La insuficiencia pulmonar, en cambio, efectivamente no gradúa.)

---

## 4. Tabla regla × válvula

**PASA** = medido y cumple · **FALLA** = medido y no cumple · **NO APLICA** = la regla no tiene
sujeto en esa válvula · **NO MEDIBLE** = no se pudo construir el escenario, con el motivo.
«(conocida)» marca las fallas que el prompt ya declaraba.

| # | Regla (resumen) | Mitral (EM/IM) | Aórtica (EAo/IAo) | Tricúspide (ET/IT) | Pulmonar (EP/IP) |
|---|---|---|---|---|---|
| 1 | Botón prendido = hay valvulopatía | **PASA** | **PASA** | **FALLA** — en pantalla sí, pero el botón **no sobrevive a guardar+reabrir** | **NO APLICA** — no existe el botón |
| 2 | La pastilla muestra el grado y sigue sola al cálculo | **PASA** | **PASA** | **FALLA** — el `<select>` sigue al cálculo y la pastilla no | **NO APLICA** — no existe la pastilla |
| 3 | El select es lo que sale; prendido y sin grado, el sustantivo | **PASA** | **PASA** | **FALLA** — el select no tiene el estado «sin grado» | **NO APLICA** |
| 4 | El cálculo usa el criterio de cada válvula | **PASA** | **PASA** — el peor manda | **PASA** — «Significativa», que es el criterio de la EAE/ASE 2009 | **PASA** — la EP autogradúa; la IP no gradúa por diseño |
| 5 | Grado a mano se mantiene; si el calculado cambia, vuelve a automático | **PASA** (IM) · **NO MEDIBLE** (EM) | **PASA** | **FALLA** — nunca suelta la marca | **NO APLICA** |
| 6 | Discrepancia → aviso rojo + cajón, y el motivo al informe | **PASA** | **PASA** | **FALLA** — no existen el aviso ni el cajón | **NO APLICA** |
| 7 | «Sin» apaga el botón; aviso y cajón aunque esté apagado | **PASA** por los dos gestos | **PASA** por el menú ▼ · **FALLA** por el desplegable | **FALLA** — el menú no ofrece «Sin» | **NO APLICA** |
| 8 | Apagar el botón apaga el grado y borra grado y fundamento | **FALLA** (conocida) | **FALLA** (conocida) | **PASA** — y es el defecto TC-405 visto del otro lado | **NO APLICA** |
| 9 | Sin grado: informe «con …»; EN SUMA la sigla + «presente» | informe **PASA** · EN SUMA **FALLA** (conocida) | informe **PASA** · EN SUMA **FALLA** (conocida) | ET **FALLA** las dos mitades · IT: informe **FALLA**, EN SUMA **PASA** («IT presente.») | **NO APLICA** |
| 10 | El informe usa el grado final, no el estado del botón | **PASA** | **PASA** | **PASA** | **PASA** |
| 11 | EN SUMA: siglas con grado, leves incluidas, frases cortas | **PASA** | **PASA** | **FALLA** — «ET leve, significativa.» (conocida) | **FALLA** — «Estenosis pulmonar severa.» sin sigla; y la **IP no llega al EN SUMA** |
| 12 | Borrar un dato no retira el grado | **PASA** | **PASA** | **PASA** (IT) · **NO MEDIBLE** (ET) | **PASA** (EP) · **NO MEDIBLE** (IP) |
| 13 | «Mixta» nunca sola: se listan las dos lesiones | **PASA** | **PASA** | **PASA** | **NO APLICA** |
| 14 | Esclerosis no abre cajón · EM sin clasificar no discrepa · prótesis mitral en silencio | **PASA** las tres | **PASA** (esclerosis) | **NO APLICA** | **NO APLICA** |
| 15 | Tricúspide y pulmonar, el mismo modelo y formato | — | — | **FALLA** — sin registro, sin aviso, sin cajón | **FALLA** (conocida) — sin botón ni pastilla |
| 16 | Nada de esto cambia cortes ni fórmulas | **PASA** — `md5` de `index.html` idéntico antes y después, `git diff` vacío | | | |

**Lo que NO se pudo medir y por qué:**

- **R5 en la EM — NO MEDIBLE, y el motivo está en el registro.** `calculables` de la entrada `em` es
  `['severa']`: `emGradoAuto` es el único escritor y sólo emite «severa» o «sin». Para probar «el
  calculado cambió» hace falta que pase de un grado a **otro grado**, y la EM no tiene un segundo
  grado al que ir — con `avm_plan` 2,8 el calculado pasa a `null`, que no es un cambio de grado.
  Medido: la marca queda en `manual=True`. No es una falla; es que la regla no tiene escenario acá.
- **R12 en la ET y en la IP — NO MEDIBLE.** La regla exige un grado puesto para ver si se retira, y
  ninguna de las dos lo autogradúa, así que la escena arranca sin grado que retirar.
- **La fila del Excel — NO MEDIBLE a nivel de fila.** La sonda no corre el exportador: generar el
  `.xlsx` abre una descarga y «Excel y reimportación solo con orden expresa». Lo que **sí** está
  medido es que los ocho campos que el exportador lee llegan con el grado correcto (§5.6).
- **El PDF como archivo — NO MEDIBLE.** jsPDF por CDN y una descarga. Se midió la **tarjeta pre-PDF**,
  que es lo que el médico confirma antes de firmar (§5.6).

---

## 5. Las fallas, con la medición literal

### 5.1 Aórtica — «Sin» por el desplegable no deja rastro ni aviso (regla 7), y se da vuelta sola

Dos gestos para el mismo acto clínico y dos resultados distintos. Escenas `R7-ea-menu` /
`R7-ea-select` / `R7-ia-select`, con Vmax 4,2 m/s y G. medio 45 (cálculo: severa):

| | Por el menú ▼ | Por el desplegable de grado final |
|---|---|---|
| botón | apagado ✓ | apagado ✓ |
| `esqSevManual` | `true` | **`false`** |
| aviso rojo | «⚠️ Sin estenosis (ajuste manual) · cálculo automático: Severa», **visible** | **vacío y oculto** |
| cajón del fundamento | **visible** | **oculto** |

Y el hueco ya declarado, ahora con su texto: escena `VUELTA-ea` — se elige «Sin estenosis» en el
desplegable y se vuelve a tocar el botón. Queda `sel='severa'`, pastilla **«Severa ▼»** y el EN SUMA
firmado dice **«EAo severa.»** sobre un «Sin estenosis» que el médico acababa de elegir.
Control que distingue: `VUELTA-em`, la mitral, conserva `sel='sin'`, muestra el aviso rojo
(«⚠️ Sin estenosis (ajuste manual) · cálculo automático: Severa») y su EN SUMA dice «Estudio sin
alteraciones estructurales ni funcionales significativas.»

**Qué puede causar:** un informe firmado que afirma estenosis aórtica severa en contra de lo que el
médico consignó, sin aviso en pantalla. Es la superficie más cara de las cuatro.
**Corrección que propondría (no hecha):** que los tres `onchange` de la aórtica pasen por el mismo
embudo que ya usa la mitral, de modo que elegir «Sin» en el desplegable marque igual que elegirlo en
el menú. Eso cierra el aviso, el cajón y la durabilidad en un solo cambio. Lo que no resuelve es el
caso del estudio **importado** sin marca — para eso sigue haciendo falta la señal nueva
(`dataset.sinExplicito`) que `docs/PENDIENTES.md` ya describe. **Es decisión de Maicol**: toca el
significado de la marca manual, que es lo que «Aórtica 3b» dejó expresamente afuera.

### 5.2 Las cuatro válvulas con registro — apagar el botón no apaga el grado (regla 8, conocida)

Escenas `R8-ea`, `R8-ia`, `R8-em`, `R8-im`: grado «Leve» a mano sobre un cálculo severo, motivo
«ajuste clinico» escrito, y se apaga el botón con un clic. Después del clic, en las cuatro:

```
pill=False   pastilla='Leve ▼'   sel='leve' (o '1')   nota='ajuste clinico'
aviso='⚠️ Leve (ajuste manual) · cálculo automático: Severa'  visible
cajón del fundamento visible
```

La regla 8 pide pastilla en «Severidad» y grado y fundamento **borrados**. No se borra nada.
Control negativo (`R8-*-neg`, apagar un botón sin grado): pastilla «🟡 Severidad ▼», `sel='sin'`,
aviso vacío y oculto — así que la sonda distingue los dos escenarios.

**Qué puede causar:** el estado que la regla 1 declara imposible — botón apagado («no hay
valvulopatía») con un grado vivo que, por la regla 10, es lo que el informe usa.
**Corrección que propondría (no hecha):** no es una línea. El dueño del gesto es `toggleValvPill`, y
la rama de apagado tendría que llamar a un `sevApagarGrado(clave)` que resetee el `<select>` a su
token «sin», borre `esqSevManual`, vacíe la nota y deje que `valvGradoVisSync` decida la visibilidad
con la mitad `discrepa` ya existente — porque la regla 8 pide explícitamente que, si el cálculo
indica otra cosa, el aviso y el cajón **queden**. Borra contenido clínico sin aviso previo (es lo que
la regla pide), así que necesita su mutación en rojo y su caso antes de entrar.

### 5.3 Regla 9 — el informe cumple en los tres estilos; el EN SUMA no dice «presente»

Con el botón prendido y sin grado, el informe narrativo sale correcto en los **tres** estilos
(escena `R9-ea`): conciso «VAo con estenosis, sin insuficiencia.», estándar «Válvula aórtica trivalva
normal, con estenosis, sin insuficiencia.», narrativo «La válvula aórtica (trivalva normal), con
estenosis, sin insuficiencia.»

El EN SUMA dice la sigla sola: **`EAo.`** · **`IAo.`** · **`EM.`** · **`IM.`** La regla pide «EAo
presente». Falla en las cuatro.

**La excepción, y es la única de toda la auditoría: la insuficiencia tricuspídea YA lo dice.** Escena
`R9-it`, EN SUMA: **`IT presente.`** O sea que la forma que la regla 9 quiere existe en la app, en la
válvula que no está en el registro. Para las otras siete el precedente de wording ya está escrito y
no hay que inventar una frase clínica nueva.

En la ET, en cambio, fallan las dos mitades: el informe dice «Estenosis tricuspídea.» —sin la forma
«con estenosis»— y el EN SUMA repite la frase larga «Estenosis tricuspídea.» en vez de la sigla.

### 5.4 Tricúspide — tiene los botones pero no la máquina (reglas 2, 5, 6, 7, 15)

El botón y el sub-botón ▼ existen; la entrada en `SEV_SINC`, el aviso y el cajón no. Medido:

- **R2** — con `it_vc` 8 mm el `<select>` se va solo a «Severa» (`sel='4'`) y la pastilla se queda en
  **«🟡 Severidad ▼»**. El grado está, la pastilla no lo muestra.
- **R4 corre y está bien** — con `et_gmedio` 7 mmHg, `et-sev` dice «Significativa» y el badge
  explica: «Estenosis tricuspídea clínicamente significativa por gradiente medio 7 mmHg (EAE/ASE
  2009 · ESC/EACTS 2021). La guía no la gradúa en leve/moderada/severa.» Eso es el criterio de la
  válvula, correctamente, y **no es un grado** — por eso la pastilla no puede seguirlo.
- **R5** — `esqSevManual` se enciende con el menú y **no se suelta nunca**: `manual=True` con
  `et_gmedio` en 7 y también con 2. No hay registro contra el que comparar.
- **R6** — `aviso` y `cajón` devuelven «no existe». ⚠️ **El control negativo de esta regla no
  distingue en la tricúspide**: elegí «Severa» esperando que coincidiera con el cálculo, pero como no
  hay cálculo registrado `discrepa` es `false` en los dos lados. El veredicto FALLA se apoya en el
  censo de nodos, no en ese control, y así queda dicho.
- **R7** — el menú ofrece `['Leve','Moderada','Severa']`: **no ofrece «Sin»**, por la costura
  declarada de `SIN_EN_MENU`. Y el `<select>` `et_grado` rechaza el valor `sin` porque sus `value`
  son los textos: `EL SELECT RECHAZO sin (opciones: Sin estenosis|Leve|Moderada|Severa)`.
- **R1 al reabrir** — escena `DUR-et`: antes de guardar `pill=True` con «Leve»; al reabrir
  **`pill=False`** y pastilla «🟡 Severidad ▼», mientras `sel='Leve'` y el EN SUMA sigue diciendo
  «ET leve, significativa.». Controles de la misma corrida: las cuatro con registro (`DUR-ea`,
  `DUR-ia`, `DUR-em`, `DUR-im`) vuelven **idénticas** —botón, pastilla, grado, nota, aviso y cajón—,
  así que el arreglo de `recalcular` del `e8b03c5` está funcionando y lo que falta es sólo en la
  tricúspide.

**Qué puede causar:** el mismo estudio firma «ET leve» con el botón prendido hoy y con el botón
apagado mañana, y nada en el estudio explica la diferencia.
**Corrección que propondría (no hecha):** darle a la tricúspide sus dos entradas en `SEV_SINC`
—`et` e `it`—, con `calculables` honesto (la ET **no** tiene vocabulario de grados: su `calcular`
debería devolver `null` siempre, y entonces R5 y R6 quedan correctamente inertes en vez de
falsamente inertes), más los nodos `et-manual-aviso`/`et-fund` y `it-manual-aviso`/`it-fund`
calcados de la mitral. Es la tanda más grande de las tres y conviene que sea su propio commit.

### 5.5 Pulmonar — el cálculo está, el modelo no (reglas 11 y 15)

No existen `#pill-*-pulmonar` ni `#sevbtn-*-pulmonar`: los 56 errores de gesto de «no existe el botón
ni el ▼» de la corrida son todos eso, y es la medición de la regla 15. Pero el cálculo corre (§3.1), así que hay dos huecos de
**salida** que no se arreglan con el botón:

- **El EN SUMA de la EP no usa la sigla.** Escena `R11-ep-leve`: EN SUMA «Estenosis pulmonar
  severa.», donde la regla 11 pide «EP severa».
- **🔴 La insuficiencia pulmonar no llega al EN SUMA.** Escena `R11-ip-leve`, con `ip_vmax` 3,0: el
  informe la afirma en los tres estilos —conciso «IP presente.», estándar «Insuficiencia pulmonar
  presente.», narrativo «Se observa insuficiencia pulmonar.»— y el EN SUMA del **mismo** estudio dice
  **«Estudio sin alteraciones estructurales ni funcionales significativas.»** El cuerpo del informe
  firmado y su conclusión se contradicen.

**Qué puede causar:** un lector que va a la conclusión —que es lo que se lee— no se entera de una
valvulopatía que el cuerpo afirma. Además el EN SUMA guardado es dato de lectura del Laboratorio
(`_labTxt`), así que la IP tampoco aparece en ninguna estadística.
**Corrección que propondría (no hecha):** que la rama de IP de `generarInforme` escriba también en el
acumulador `suma`, con la sigla. Es la más barata de las tres y la de mayor consecuencia clínica.
⚠️ Toca el texto de una superficie firmada, así que **se reporta y se espera**. Y hay que mirarla
junto con la nota de `docs/PENDIENTES.md` sobre las leves pulmonares y la lista blanca de
vocabulario, porque las dos escriben en el mismo lugar.

### 5.6 Lo que sí cumple, con su medición — para que no se lea como «no se probó»

- **R4, el peor criterio de la estenosis aórtica.** Escena `R4-ea-peor`: Vmax **2,6** m/s (que sola
  da leve) + G. medio **48** mmHg (que solo da severa) → `sel='severa'`, pastilla «Severa ▼».
  Control negativo `R4-ea-neg`: los dos bajos (2,6 y 18) → `'leve'`. La sonda distingue.
- **R6 completa en las cuatro con registro.** `R6-ea`: aviso «⚠️ Leve (ajuste manual) · cálculo
  automático: Severa», cajón visible, y el motivo llega al informe en los tres estilos —«…con
  estenosis leve, sin insuficiencia (Vmax 4.2 m/s, Gmedio 45 mmHg) **(jet excentrico)**»—. Control
  negativo `R6-*-neg` (elegir el grado que coincide): `discrepa=False`, aviso vacío, cajón oculto.
  La EAo agrega además una oración de discrepancia propia en el informe y en el EN SUMA que las otras
  tres no tienen: «EAo: el grado consignado (leve) no coincide con las mediciones (corresponderían
  severa) - revisar.» No es una falla de ninguna regla, pero es una **asimetría de superficie
  firmada** y queda declarada.
- **R13, «mixta» nunca sola.** Las tres válvulas con dos botones listan las dos lesiones:
  «…con estenosis severa **e** insuficiencia severa», y el EN SUMA las separa en dos renglones
  («EAo severa.» / «IAo severa.»). La palabra «mixta» no aparece. Control negativo (una sola lesión):
  «…con estenosis severa, **sin** insuficiencia».
- **R14, las tres excepciones.** Esclerosis: pastilla «Esclerosis ▼», `discrepa=False`, **cajón
  oculto**, informe «con esclerosis valvular, sin estenosis significativa ni insuficiencia»; control
  negativo con «Leve» en la misma escena. EM sin clasificar: `discrepa=False`. Prótesis mitral en
  silencio: «Válvula mitral con prótesis mecánica (AVm 1.2 cm² por planimetría).», sin grado; control
  negativo con mitral nativa: «con estenosis severa (AVm 1.20 cm² por planimetría)».
- **«Nuevo estudio» no deja rastro.** Escena `NUEVO-ea`: antes, pastilla «Leve ▼», nota «jet
  excentrico», cajón visible; después, `pill=False`, «🟡 Severidad ▼», `sel='sin'`, nota vacía, cajón
  oculto y EN SUMA «Estudio sin alteraciones estructurales ni funcionales significativas.»
- **Tarjeta pre-PDF.** Abre, ofrece los siete controles (`rev-im`, `em_grado`, `rev-ia`, `ea_grado`,
  `rev-it`, `et_grado`, `vp_morf`), llega con el grado correcto (`ea_grado='leve'` en `PDF-ea`,
  `et_grado='Leve'` en `PDF-et`) y cierra al confirmar. **Nota:** no ofrece control para `ep_grado`
  ni para `ip_grado` — sólo `vp_morf` —, así que la pulmonar no se puede corregir en la tarjeta.
- **Los ocho campos que lee el Excel** llegan con el grado puesto por el gesto. En `PDF-et`:
  `{ea_grado:'sin', ia_grado:'0', em_grado:'sin', im_grado:'0', et_grado:'Leve', it_grado:'0',
  ep_grado:'sin', ip_grado:'Sin insuficiencia'}`.

---

## 6. Medición adicional: los recuadros de severidad del Doppler (solo lectura)

El caso que observó Maicol es real, y **es más amplio de lo que parecía**: no es el escenario «Leve»,
son los cuatro. El recuadro `#ea-sev` imprime el grado correcto y le pega al lado, siempre, los
umbrales de **severa**:

| Vmax tipeada | `gmax_calc` | `#ea-sev` — texto literal | `ea_grado` |
|---|---|---|---|
| 1,8 m/s | 13,0 | `Sin estenosis — por velocidad (Vmáx ≥4,0 m/s · G. medio ≥40 mmHg)` | `sin` |
| 2,2 m/s | 19,4 | `Leve — por velocidad (Vmáx ≥4,0 m/s · G. medio ≥40 mmHg)` | `leve` |
| 3,2 m/s | 41,0 | `Moderada — por velocidad (Vmáx ≥4,0 m/s · G. medio ≥40 mmHg)` | `moderada` |
| 4,5 m/s | 81,0 | `Severa — por velocidad (Vmáx ≥4,0 m/s · G. medio ≥40 mmHg)` | `severa` |

**Sí: el texto aclaratorio cita umbrales de otro grado, en tres de los cuatro escalones.** Sólo la
fila de «Severa» es coherente. El grado está bien en las cuatro; lo que miente es el paréntesis.

**Dónde está.** `_eaPintarRecuadroDoppler`: el paréntesis es un **literal de plantilla**, no una
tabla por grado —

```
'<span …> &mdash; por ' + R.criterioVelGrad +
' (Vm&aacute;x &ge;4,0 m/s &middot; G. medio &ge;40 mmHg)</span>'
```

`R.criterioVelGrad` sí varía («velocidad» / «AVA»); los dos números, no. El bloque ya tiene una
guarda para el caso protésico y el de fuera de banda (ambas agregadas por `/sharp-edges`), así que
este no es un olvido de guarda: es la cadena misma.

**Qué puede causar:** el recuadro se lee como «este grado sale de estos cortes», y en «Leve» dice lo
contrario de lo que hizo. Es el mismo defecto de las dos mitades contradiciéndose en pantalla que el
propio comentario de esa función declara haber cerrado cinco veces en la aórtica, reabierto por la
mitad que nadie revisó: el paréntesis.

**Corrección que propondría (no hecha):** o el paréntesis nombra los cortes **del grado que está
mostrando** —lo que exige una tabla de cortes por grado, y los cortes son contenido clínico—, o se
reduce a decir sólo el criterio («— por velocidad»), sin números, que es lo que la primera línea
necesita para que la segunda (la del AVA) siga teniendo sentido. **Las dos son decisión de Maicol**
porque cambian el texto que acompaña a un grado. No se tocó nada.

**Recuadro mitral — NO MEDIBLE en la pestaña Doppler.** Con `avm_plan` 1,2 el `em_grado` se va a
«severa», pero el barrido de la pestaña Doppler (ids conocidos más un rastreo abierto de todo nodo
hoja cuyo texto tuviera un grado y un `≥`) no devolvió **ningún** recuadro mitral: el único nodo
candidato es `#em-sev-integrada`, que vive en la pestaña **Válvulas**, no en Doppler. Así que la
pregunta «¿el recuadro mitral del Doppler también cita umbrales de otro grado?» queda **sin
responder**, no respondida que no. Si lo que te interesa es `#em-sev-integrada`, se mide corriendo
`node scripts/auditoria_botones.mjs --solo DOP` con ese id agregado a la lista.

---

## 7. Verificación de que esto fue de solo lectura

- `md5` de `index.html` **antes**: `3d5887efb09bb24d96f00b6a66091ef7`
- `md5` de `index.html` **después**: `3d5887efb09bb24d96f00b6a66091ef7` — la sonda lo comprueba sola
  en cada corrida y lo deja en su JSON (`md5Igual: true`).
- `git diff index.html` → vacío. No se tocaron la suite, el exportador ni los tests.
- 183 escenas, **cero inválidas** con la sonda endurecida: cero denominadores incompletos (`den.ok`
  en las 183) y **cero errores de instrumentación** (lo que antes se llamaba «errores de arnés»; la
  sonda ahora los separa de los hallazgos y, si aparece uno, sale con `exitCode ≠ 0`). La corrida
  salió con `exitCode 0`. Los **72** errores de gesto que quedan **son** los hallazgos de ausencia
  estructural: **62 en la pulmonar** (56 de «no existe el botón ni el ▼», 6 de «no existe el cajón de
  fundamento») y **10 en la tricúspide** (2 de «el menú no ofrece Sin», 1 del `<select>` que rechaza
  el token «sin», 7 de «no existe el cajón»). El conteo anterior —56 (38 + 18)— era de la sonda
  previa al arreglo del denominador (`d01e18e`, que medía la pulmonar sobre geometría cero) y a este
  endurecimiento; **ningún veredicto de la tabla cambió**, sólo la forma de contar y clasificar.
- `EA_ESCALON_SIN_GRADO` leído de la fuente: `true`.

### Tres veces que esta sonda mintió antes de medir bien

Queda escrito porque el próximo que la use va a volver a pisar alguna:

1. **`Input.insertText` no escribía nada y no devolvía error.** Los campos quedaban vacíos y la sonda
   informó «la pastilla no sigue al cálculo» en seis de las ocho lesiones — un hallazgo falso entero.
   Lo arregló la **lectura de vuelta obligatoria**: si el campo no termina con el valor pedido, el
   gesto devuelve el motivo. «El cálculo no gradúa» y «el insumo no entró» se ven idénticos desde
   afuera.
2. **El orden del gesto estaba al revés.** Los insumos viven DENTRO del cajón que el botón abre, o en
   la pestaña Doppler; tipeando antes del clic el campo no tenía geometría. Ahora el clic va primero
   y hay un `revelar()` que abre pestaña, acordeón, tarjeta plegable o solapa interna con las
   funciones reales de la app.
3. **Después de un tipeo tardío la app quedaba en la pestaña Doppler**, así que la visibilidad del
   aviso y del cajón se medía sobre Válvulas oculta: geometría cero leída como «la app no lo
   muestra». Las escenas de R5 y R12 reportaron eso antes de reponer el denominador.

Y una del analizador, que no es la sonda pero cuenta igual: el filtro que extrae las frases del
informe buscaba sólo el nombre largo de la válvula, y el estilo **conciso** usa siglas (`VAo`, `VM`,
`VT`, `VP`). La frase «VAo con estenosis» salía como lista vacía y por un rato pareció que el conciso
no afirmaba nada. **Las cuatro veces el error iba en la dirección de inventar un defecto**, no de
tapar uno — pero un defecto inventado en un informe de auditoría cuesta lo mismo de rastrear.
