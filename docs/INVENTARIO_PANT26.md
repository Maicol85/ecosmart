# Inventario y premisas — tanda PANT-26 (2026-11-09)

Commit 1, **de solo lectura**: no cambia una linea de `index.html`. El md5 del archivo es
**`a14c45a0`** antes y despues de este commit, con **169.037** lineas y **12.323.864** bytes, y
el sello del pie es **`v20261109-1203`** — los tres identicos a lo que `CLAUDE.md` publica y a
lo que `docs/REGISTRO_TANDAS.md` da como cierre de PANT-27. `origin/main` = `HEAD` =
**`3476036`**, el pendrive `DISK_IMG` montado.

Lo que sigue se midio **sobre este arbol**, con el gesto real, no se copio de
`docs/AUDITORIA_PROTESIS.md`. Las sondas son `scripts/_probe_pant26inv.mjs` (nueva) y
`scripts/_probe_pant26esc.mjs` (copia con nombre propio de `_probe_audprot_escenas.mjs`, que no
se sobrescribio). Las dos declaran su denominador y **ninguna escribe en el proyecto**.

---

## 0 · Las premisas de la orden, una por una

| hipotesis de la orden | medicion | veredicto |
|---|---|---|
| la frase «sin datos suficientes para graduar la estenosis protesica» sale solo en la **aortica** | censadas las cuatro posiciones: la mitral, la tricuspide y la pulmonar **no escriben nada** en el papel cuando no concluyen (su bloque es `if (veredicto positivo)` sin `else`) | **SE REPRODUCE** |
| una TAVI con desajuste severo sale «normofuncionante» en el papel | escena X1 reproducida: informe «La valvula aortica presenta una protesis transcateter tipo TAVI normofuncionante (DVI 0.40).» y, el renglon siguiente, «Desajuste protesico-paciente aortico severo (AEO indexada 0.44 cm²/m²).»; EN SUMA «TAVI normofuncionante. / PPM aortico severo.» | **SE REPRODUCE** |
| la TAVI nunca compara su area contra el modelo | escenas 5 y 6, con modelo de `PROT_CAT_TAVI` cargado por el gesto real: `eoaEvaluable: false`, `eoaZ: null` en las dos | **SE REPRODUCE** |
| los 9 modelos de TAVI tienen desvio estandar | `PROT_CAT_TAVI`: **9 de 9** modelos sirven, **26 de 26** celdas de area traen desvio mayor que cero | **SE REPRODUCE** |
| 28 de los 108 modelos del catalogo no tienen desvio | medido en los dos catalogos que esta tanda toca: `PROT_CAT_TAVI` **0 de 9** sin desvio, `PROT_CAT_A4` **3 de 49** (Edwards Duromedics f.54, Hancock f.55, Monostrut Bjork-Shiley f.57) | **SE REPRODUCE** (la cifra de 28 es del total de cinco catalogos y la deja abierta **PRO-b**) |
| la mitral muestra a la vez «sugiere obstruccion significativa» y «hallazgo aislado — posible obstruccion» | escena 13, textual: la fila de la velocidad dice «2.60 m/s  (sugiere obstruccion significativa · <1.9 normal · ≥2.5 significativa)» y el renglon del veredicto «hallazgo aislado — posible obstruccion  (gradiente medio 14.0 mmHg · 1 de 1 criterio)» | **SE REPRODUCE** |
| la capsula no se repinta al elegir el modelo porque la funcion que llaman los selectores no esta definida | `vModTrasElegir` tiene **dos llamadas guardadas** (lineas 73949 y 73956) y **cero definiciones** en todo el archivo; la sonda confirma `typeof vModTrasElegir === 'function'` **falso** y `window.vModTrasElegir` **falso** | **SE REPRODUCE** |
| la Evidencia de la protesis aortica ya razona las causas ante un resultado posible | la seccion devuelve `causas` con **cinco** entradas y `causasNota`; con la escena en `posible` se marca sola la rama que la Figura 13 decide | **SE REPRODUCE** → el commit 4 (c) **no cambia nada** |
| la suite tiene **783** casos | contados nombre por nombre en `scripts/test_clinico.mjs`: **768** apariciones, **768** distintos, de `TC-001` a `TC-768`, **cero huecos y cero duplicados** | **NO SE REPRODUCE** → P26-a. Los TC libres arrancan en **TC-769** |

---

## 1 · (a) El motor del veredicto aortico

| pieza | quien | linea |
|---|---|---|
| el veredicto | **`eaProtVeredicto()`** | 74162 |
| un parametro, tres niveles | `_eaProtNivel(val, normalMax, signifMin, mayorEsPeor, signifEstricto)` | 74092 |
| el area frente al modelo | **`eaProtEOAz()`** | 74144 |
| el narrativo del papel y el EN SUMA | **`eaProtNarrativa(P)`** | 74405 |
| la capsula de pantalla | `_eaProtPintar(P)` · `_eaProtPorque(P)` 74517 | 74567 |
| las frases | `EA_PROT_TXT` 74323 · `EA_PROT_NORMO` 74350 · `EA_PROT_SALV` 74354 | |
| el bloque del informe | el `inf.push(_normoT ? … : …)` y el `suma.push` | 62758-62795 |

**Como trata la TAVI frente a la quirurgica.** Comparten el motor entero: `esTavi = (morf === 'TAVI')`
y `via` vale `'TAVI'` o `'SAVR'`. Las **cuatro** diferencias, medidas:

1. `EA_PROT_SALV.tavi` se agrega a las salvedades de pantalla.
2. **`eaProtEOAz()` devuelve `null`**: su primera condicion exige `Prótesis mecánica` o
   `Prótesis biológica`, asi que con TAVI el area efectiva **nunca** es eje independiente.
3. La rama `normoTavi`, que solo existe para TAVI.
4. El bloque de «normofuncionante» del final del EN SUMA la excluye con `P.via === 'TAVI'`.

**`eaProtEOAz()`: quien la llama, con que catalogo, y que haria falta para la TAVI.**
Un solo llamador: `eaProtVeredicto`, en `const _eoaZ = (typeof eaProtEOAz === 'function') ? eaProtEOAz() : null;`
→ `nv.eoa` → `indep = [nv.dvi, nv.eoa]`. El catalogo lo elige `vModEsperados('va')`, que pasa por
`vModCatalogo('va')`, y **ese ya devuelve `PROT_CAT_TAVI` por la morfologia**: el componente
«Modelo y tamaño» funciona con TAVI y publica sus esperados. Lo unico que bloquea la TAVI es la
**primera linea** de `eaProtEOAz`. Para que la use **no hay que duplicar nada ni tocar el
catalogo**: alcanza con aceptar `TAVI` en esa condicion; las otras tres —modelo del catalogo (no
manual), desvio mayor que cero, `ava_cont` sin la marca «(revisar)»— ya valen igual. **Un solo
dueño**, `eaProtEOAz`, y los mismos cortes `EA_PROT_EOA_Z = { normalMin: -1, signifMax: -2 }`.

---

## 2 · (b) La escena del medico y sus variantes — el texto EXACTO de cada superficie

Base del arbol actual, medido con `_probe_pant26esc.mjs`. Las lineas de otras valvulas se omiten.

### Escena del medico — TAVI, Vmax 4,5 m/s, G. medio 45 mmHg, sin DVI ni area, sin modelo

`eaProtVeredicto()`: `via: 'TAVI'`, `nivel: 'faltan'`, `pDep: 'signif'`, `pIndep: null`,
`niveles: {vmax:'signif', atet:null, at:null, gmed:'signif', dvi:null, eoa:null}`, `ppm: null`,
`eoaEvaluable: false`.

| superficie | texto, literal |
|---|---|
| **pantalla**, capsula `#ea-det-sev` | `Falta un dato para aplicar la tabla` |
| **pantalla**, rotulo | `⚖️ Severidad EA protésica (ASE 2024)` |
| **pantalla**, el porque | `Falta el DVI, que es el único eje independiente del flujo que esta aplicación puede evaluar sin un modelo cargado.` |
| **informe conciso** | `VAo con prótesis transcatéter tipo TAVI, sin datos suficientes para graduar la estenosis protésica (Vmax 4.5 m/s, G. medio 45 mmHg).` |
| **informe estandar** | `Válvula aórtica con prótesis transcatéter tipo TAVI, sin datos suficientes para graduar la estenosis protésica (Vmax 4.5 m/s, G. medio 45 mmHg).` |
| **informe narrativo** | `La válvula aórtica presenta una prótesis transcatéter tipo TAVI, sin datos suficientes para graduar la estenosis protésica (Vmax 4.5 m/s, G. medio 45 mmHg).` |
| **EN SUMA** | `Válvula aórtica con prótesis transcatéter tipo TAVI, sin datos suficientes para graduar la estenosis protésica (Vmax 4.5 m/s, G. medio 45 mmHg).` — es la **linea del cuerpo reusada**, porque con `faltan` el `resumen` es `null` |
| **PDF** | lee `sv('informe_texto')`: el cuerpo tal cual |
| **PPT** | copia `inf.campos.informe_texto`: el cuerpo tal cual |
| **Guardados** | ida y vuelta medida: vuelve `TAVI`, 4.5 y 45, `nivel: 'faltan'` y **el mismo texto palabra por palabra** |
| **Laboratorio** | `_labTxt` concatena `en_suma` + `informe_texto`: hereda. **Ninguna columna publica el veredicto de estenosis protesica** |

### Las variantes

| escena | `nivel` | capsula | papel (estandar), linea aortica |
|---|---|---|---|
| 9 · quirurgica **biologica**, Vmax 4,5 + G. 45 | `faltan` | `Falta un dato para aplicar la tabla` | `Válvula aórtica con prótesis biológica, sin datos suficientes para graduar la estenosis protésica (Vmax 4.5 m/s, G. medio 45 mmHg).` |
| 10 · quirurgica **mecanica**, iguales | `faltan` | igual | igual con «prótesis mecánica» |
| 3 · TAVI + **DVI normal 0,50** | `posible` | `Posible estenosis protésica` | `… con posible estenosis protésica (Vmax 4.5 m/s, G. medio 45 mmHg, DVI 0.50).` · EN SUMA `Prótesis aórtica: posible estenosis protésica.` |
| 4 · TAVI + **DVI bajo 0,20** | `signif` | `Sugiere estenosis protésica significativa` | `… con criterios que sugieren estenosis protésica significativa (…, DVI 0.20).` |
| 5 · TAVI + **modelo y area NORMAL** | `posible` | `Posible estenosis protésica` | `… con posible estenosis protésica (Vmax 4.5 m/s, G. medio 45 mmHg, DVI 0.52).` — **`eoaZ: null`: el area NO vota** |
| 6 · TAVI + **modelo y area MUY por debajo** | `posible` | `Posible estenosis protésica` | `… con posible estenosis protésica (…, DVI 0.40).` + `Desajuste protésico-paciente aórtico severo (AEO indexada 0.44 cm²/m²).` — **`eoaZ: null`** |
| 7 · TAVI con **desajuste** (Vmax 2, G. 12) | `normal` | `Sin criterios de estenosis protésica` | `… sin criterios de estenosis protésica (Vmax 2 m/s, G. medio 12 mmHg, DVI 0.40).` + la linea del desajuste |
| 8 · TAVI con **regurgitacion paravalvular** | `faltan` | `Falta un dato…` | la frase vieja; `_normoRpvOk` en falso bloquea «normofuncionante» |
| 12 · quirurgica **mecanica + modelo a −2 DE** | `signif` | ⚠️ **`Posible estenosis protésica`** (ver X4) | `… con criterios que sugieren estenosis protésica significativa` — **el papel y la pantalla discrepan** |

---

## 3 · (c) Los estados EXACTOS que hoy producen la frase vieja

Censo **combinatorio** de `_probe_pant26inv.mjs`: dos morfologias (`TAVI` y `Prótesis biológica`)
× cuatro bandas de la velocidad (ausente · normal · posible · significativa) × cuatro del
gradiente medio × eje independiente presente o ausente = **64** escenas, con los valores tomados
de `EA_PROT_CRIT` y no tecleados. **34** producen `frase` con la cadena vieja.

**Los 24 que la decision D1 toca** —`pDep` en `posible` o `signif` y **sin** eje independiente—:
12 con `TAVI` y 12 con `Prótesis biológica`, que son todas las combinaciones donde al menos uno
de los dos ejes dependientes cae en banda `posible` o `signif` y el DVI no esta. En los 24,
`normoTavi` es **falso**, asi que no chocan con la rama de «normofuncionante».

**Los 10 que NO se tocan**, y por que:

| morfologia | velocidad | gradiente | indep | `pDep` | lo que el papel publica HOY |
|---|---|---|---|---|---|
| TAVI | ausente | ausente | no | `null` | `… tipo TAVI normofuncionante.` |
| TAVI | ausente | ausente | **si** | `null` | `… tipo TAVI normofuncionante (DVI 0.50).` |
| TAVI | ausente | normal | no | `normal` | `… tipo TAVI normofuncionante (G. medio 15 mmHg).` |
| TAVI | normal | ausente | no | `normal` | `… tipo TAVI normofuncionante (Vmax 2 m/s).` |
| TAVI | normal | normal | no | `normal` | `… tipo TAVI normofuncionante (Vmax 2 m/s, G. medio 15 mmHg).` |
| biologica | ausente | ausente | no | `null` | **la frase vieja**, sin parentesis |
| biologica | ausente | ausente | **si** | `null` | **la frase vieja** `(DVI 0.50)` |
| biologica | ausente | normal | no | `normal` | **la frase vieja** `(G. medio 15 mmHg)` |
| biologica | normal | ausente | no | `normal` | **la frase vieja** `(Vmax 2 m/s)` |
| biologica | normal | normal | no | `normal` | **la frase vieja** `(Vmax 2 m/s, G. medio 15 mmHg)` |

O sea: **en la TAVI los cinco estados sin velocidad ni gradiente altos ya dicen
«normofuncionante»** y la frase vieja no llega al papel; **en la quirurgica los cinco siguen con
la frase vieja**, y es correcto por la decision D1, que solo alcanza a los estados con velocidad
o gradiente en banda `posible` o `signif`.

⚠️ **Y los 30 estados restantes de los 64 no usan la frase vieja**: con el eje independiente
presente el nivel sale `normal`, `posible` o `signif` y el papel publica su propia frase.

---

## 4 · (d) Los nueve caminos de «normofuncionante», y como los guarda hoy la condicion

La unica guarda, textual (`eaProtNarrativa`):

```js
const _normoTavi = P.via === 'TAVI' && P.nivel === 'faltan' && (function(){
  const nv = P.niveles || {};
  return Object.keys(nv).every(function (k) { return nv[k] == null || nv[k] === 'normal'; });
})();
```

y en el bloque del informe: `_normoT = !!_eaProtN.normoTavi && !insE && _normoRpvOk`.

**`P.niveles` tiene exactamente seis claves** —`vmax`, `atet`, `at`, `gmed`, `dvi`, `eoa`— y
**el desajuste NO es una de ellas**: viaja en `P.ppm`, fuera del objeto que la guarda recorre.
Reproducido en X1.

| # | camino | sale con desajuste | medido |
|---|---|---|---|
| 1 | cuerpo del informe, tres estilos | **SI** | X1 |
| 2 | EN SUMA, por `EA_PROT_NORMO.suma` | **SI** | X1: `TAVI normofuncionante.` |
| 3 | PDF | **SI**, heredado de `informe_texto` | |
| 4 | PPT | **SI**, heredado | |
| 5 | Guardados | **SI**, heredado | X3 |
| 6 | Laboratorio (busqueda de texto) | **SI**, heredado por `_labTxt` | |
| 7 | pantalla | **NO**: `EA_PROT_TXT.faltan` no tiene la palabra | |
| 8 | Evidencia | **NO**: cero apariciones en las cuatro secciones | |
| 9 | bloque de «normofuncionante» del final del EN SUMA | **NO**: lo bloquea `P.via === 'TAVI'` | |

Los **seis** que publican son el 1 al 6, y los seis cuelgan de **un solo** predicado: `_normoTavi`.
Arreglarlo ahi es el **unico dueño**.

---

## 5 · (e) La mitral

La fila la pinta `_t11Fila(id, val, fuera, nivel, uni, dec, normalMax, signifMin, normalIncl, signifIncl, donde, retiro)`
dentro de `vmProtEOAPintar()` (72771), con
`OBSTR_TXT = { normal:'sin criterios de obstrucción', posible:'posible obstrucción', significativa:'sugiere obstrucción significativa' }`.
El texto de una fila con dato es
`val + ' ' + uni + '  (' + OBSTR_TXT[nivel] + ' · ' + escala + ')'`.

Medido en la escena 13 (velocidad pico de E 2,6 m/s y gradiente medio 14 mmHg):

| nodo | texto HOY |
|---|---|
| `#vm-prot-vmax` | `2.60 m/s  (sugiere obstrucción significativa · <1.9 normal · ≥2.5 significativa)` |
| `#vm-prot-gmed` | `14.0 mmHg  (sugiere obstrucción significativa · ≤5 normal · >10 significativa)` |
| `#vm-prot-thp` | `—  (sin medir — se carga en Doppler Mitral)` |
| `#vm-prot-eoa` | `—  (falta Ø TSVI, VTI TSVI, VTI mitral CW)` |
| `#vm-prot-dvi` | `—` |
| `#vm-prot-obstr` (el **resumen**) | `hallazgo aislado — posible obstrucción  (gradiente medio 14.0 mmHg · 1 de 1 criterio)` |

Y en la escena 14, con THP 240: el THP dice
`240 ms  (sugiere obstrucción significativa · <130 normal · >200 significativa)` y el resumen
`sugiere obstrucción significativa  (gradiente medio 14.0 mmHg, THP 240 ms · 2 de 2 criterios)`.

⚠️ **La velocidad pico NO VOTA** —`VM_PROT_OBSTR_VOTAN = [eoa, dvi, gmed, thp]`— y sin embargo su
fila publica «sugiere obstruccion significativa». Es el defecto que la orden describe.

**¿El papel lee alguna de las dos?** **No.** El informe usa `vmProtObstrCrit(R)` y `R.obstr`, que
salen de `vmProtEOA()`, el dueño de datos; el pintor **solo escribe `textContent`** y no lo lee
nadie. La linea del papel es `Prótesis mitral con hallazgos sugestivos de obstrucción (<criterios>).`,
y solo con `R.obstr === 'significativa'`. Asi que D5 **no toca el papel** — se verifica con el A/B.

---

## 6 · (f) La pulmonar, y la salvedad actual de la TAVI

**La pulmonar.** `vpProtObstr()` (55505): `R.obstr = R.pos.length ? 'posible' : (R.med.length ? 'sin' : null)`.
**Alcanza UN criterio positivo** sobre dos (velocidad pico y gradiente medio), sin umbral de
conteo. Medido en la escena 18: la fila del veredicto dice
`posible obstrucción  (velocidad pico 3.5 m/s, gradiente medio 25.0 mmHg · 2 de 2 criterios)` y
el papel `Prótesis pulmonar con posible obstrucción (velocidad pico 3.5 m/s, gradiente medio 25.0 mmHg).`

Su tarjeta ⓘ **no tiene nota**: `QV_NOTA` tiene cuatro claves —`prot:tricuspide`, `prot:mitral`,
`insuf:aortica`, `esten:pulmonar`— y **`prot:pulmonar` no esta**. Lo que si tiene es
`QV_FUENTE['prot:pulmonar']`, que devuelve
`VP_PROT_FUENTE` = «ASE 2024 (Zoghbi), Tabla 15, folio 33. Sus dos columnas son «Normal» y
«Possible obstruction»: esa tabla no publica una columna de severa.»
El molde de la casa para declarar lo propio en una nota es `QV_ECOSMART = 'Criterio de EcoSmart: '`,
y la nota de la tricuspide y la de la mitral usan `QV_INTEGRA_TXT`, que declara su umbral de dos
en voz alta. **La declaracion pulmonar va en `QV_NOTA`, no en `QV_FUENTE`**: lo segundo es una
cita y esto no lo es.

**La salvedad actual de la TAVI**, `EA_PROT_SALV.tavi`, textual:

> Para TAVI la Tabla 5 expresa el gradiente medio, el DVI y el área efectiva como cambio respecto
> de un estudio previo, con el basal definido como un estudio en condiciones hemodinámicas
> estables; sin ese estudio se aplican los cortes absolutos de la prótesis quirúrgica
> (ASE 2024, hoja 18, folio 19).

La atribucion a la guia de **esos cortes** es el cierre `(ASE 2024, hoja 18, folio 19)`, pegado a
la clausula «sin ese estudio se aplican los cortes absolutos de la prótesis quirúrgica». La
primera mitad **si** es de la guia y nombra su tabla, asi que esa parte no se toca.

⚠️ **PANT-27 reescribio el ultimo parrafo del globo `tavi-calc`** (calcificacion severa). Esta
tanda **no lo toca**: la salvedad de la TAVI vive en `EA_PROT_SALV.tavi`, que es otro lugar.

---

## 7 · (g) El desajuste: quien lo publica, que mira y de donde saca la referencia

| pieza | quien |
|---|---|
| la clasificacion | `_eaPpmAoClasificar(avai, imc)` (74028), dueño unico desde la tanda Z |
| los cortes | `EA_PROT_PPM_CORTES = { imcBajo:{normalMin:0.85, severoMax:0.65}, imcAlto:{normalMin:0.70, severoMax:0.55} }` (`normalMin` exclusivo, `severoMax` inclusivo) |
| las frases | `ppmFrases('aortica', grado, avai)` (72760) → cuerpo «Desajuste protésico-paciente aórtico `<grado>` (AEO indexada `<x>` cm²/m²).», EN SUMA «PPM aórtico `<grado>`.» |
| el `if` que lo publica | bloque del informe: `if (_eaProtP && (_eaProtP.ppm === 'moderado' \|\| _eaProtP.ppm === 'severo') && _eaProtP.nivel !== 'signif')` |
| el insumo | **`#ava-idx`**, que escribe `calcAo` a partir del Ø del TSVI y los dos VTI; se LEE, no se recalcula; con la marca «(revisar)» no se clasifica |

**Las condiciones que mira hoy son dos**: que el grado sea `moderado` o `severo`, y que el
veredicto **no** sea `signif` (PANT-18-7, Figura 13). **No mira el modelo**: el area de referencia
del modelo **no entra** en el calculo del desajuste, que es `AVA por continuidad ÷ superficie
corporal` contra un corte absoluto por IMC.

**De donde saldria el area de referencia del modelo**, si la condicion D7 la necesita:
`vModEsperados('va').vals.eoa` → `[media, desvio]`, el mismo par que `eaProtEOAz` ya lee. O sea
que la comprobacion de «dentro de 1 desvio estandar» se puede hacer con **lo que `eaProtEOAz` ya
devuelve** (`z`), sin un segundo lector del catalogo.

---

## 8 · (h) La capsula: el defecto reproducido

Escena: `Prótesis mecánica`, Vmax 4,5, G. medio 45, Ø TSVI 16 mm, VTI 40/100 (DVI 0,40, normal),
y despues se carga **Abbott Epic 27** por el gesto real del componente (boton → buscador →
sugerencia → tamaño → «Elegir»), que deja el area medida de 0,80 cm² a **−2,0 DE**.

| momento | `eaProtVeredicto().nivel` | `#ea-det-sev` dice |
|---|---|---|
| antes del modelo | `posible` | `Posible estenosis protésica` |
| **tras elegir el modelo** | **`signif`** | **`Posible estenosis protésica`** |
| tras volver a tipear la velocidad | `signif` | **`Posible estenosis protésica`** |
| llamando `calcEADetalle()` a mano | `signif` | `Sugiere estenosis protésica significativa` |

El recuadro `caja-esten-aortica` estaba **visible** en los cuatro momentos (`cajaVisible: true`),
asi que no es una medicion sobre un contenedor cerrado. Y el **plegable** sigue publicando «El
área efectiva no se evalúa: … en este estudio no hay un modelo del catálogo cargado» con el
modelo **cargado** (`quedoCargado: true`, `modelo: 'Abbott Epic'`, `tam: '27'`).

**La causa, medida:** `vModElegir` y `vModQuitar` terminan con
`if (typeof vModTrasElegir==='function') vModTrasElegir(pos);` y **`vModTrasElegir` no existe en
el archivo** —dos llamadas guardadas, cero definiciones, cero en `window`—, asi que nada llama a
`calcEADetalle`, que es quien llama a `_eaProtPintar`. Llamarla a mano pone la capsula de acuerdo:
eso es lo que separa «falta un repintado» de «hay dos criterios distintos».

**Quien mas la llama:** nadie. Las dos llamadas son las dos lineas de `vModElegir` (73949) y
`vModQuitar` (73956).

---

## 9 · (i) La Evidencia de la protesis aortica ante un resultado «posible»

**Ya razona las causas, y no se cambia nada.** Con la escena TAVI Vmax 4,5 + G. medio 45 + DVI
0,50 (`nivel: 'posible'`), la seccion devuelve `causas` con **cinco** entradas y `causasNota`.
Copiadas sin cambiarlas:

- **Estado de hiperflujo** (`marca: 'ok'` — se marca sola): «Con el cociente entre la velocidad
  del tracto de salida y la de la prótesis en 0,30 o más, el algoritmo de la guía separa las dos
  ramas por el área efectiva indexada: por encima de 0,85 cm²/m² apunta a un estado de
  hiperflujo. ASE 2024, Figura 13, hoja 18, folio 19.»
- **Desajuste prótesis-paciente** (`marca: 'none'`): «Con ese mismo cociente en 0,30 o más y el
  área efectiva indexada por debajo de 0,85 cm²/m², el algoritmo apunta a un desajuste
  prótesis-paciente. La misma guía agrega que los gradientes suben exponencialmente cuando el
  área indexada está por debajo de 0,8 a 0,9 cm²/m². ASE 2024, Figura 13, hoja 18, folio 19, y
  hoja 9, folio 10.»
- **Un problema de medición** (`marca: 'ask'`): «En la banda intermedia del cociente —de 0,25 a
  0,29— la guía pide considerar una estenosis con tracto de salida pequeño, una posición
  inadecuada del volumen de muestra del Doppler pulsado en el tracto de salida, o una
  subestimación de la velocidad del chorro. ASE 2024, Figura 13, hoja 18, folio 19.»
- **Trombosis, calcificación o pannus** (`marca: 'ask'`): «La guía enumera la movilidad reducida
  por trombo, calcificaciones o pannus como las causas de obstrucción de una prótesis, y para
  distinguirlas pone la tomografía con contraste a la par del transesofágico tridimensional.
  ASE 2024, hoja 9, folio 10.»
- **Estenosis subvalvular** (`marca: 'ask'`): «Con el cociente por debajo de 0,25 el algoritmo
  pide considerar una estenosis valvular, la trombosis incluida, y una estenosis subvalvular.
  ASE 2024, Figura 13, hoja 18, folio 19.»
- `causasNota`: «Esta lista no gradúa ni concluye: es lo que la ASE 2024 enumera para un gradiente
  protésico elevado. Se marca sola únicamente la rama que el algoritmo de su Figura 13 decide con
  el cociente de VTI y el área efectiva indexada que esta aplicación ya calcula.»

→ **El commit 4 (c) no escribe ninguna lista de causas**, y no hay nada que parar.

---

## 10 · El 3D de congenitas — las tres mediciones que el commit 6 pide

| lo que la orden pide medir | medicion | veredicto |
|---|---|---|
| (1) los rotulos reales de los dos botones del control segmentado | los dos botones son `.cm3d-md` con `data-m`, y su texto es **«Según el estudio»** y **«Explorar»**, palabra por palabra | **coinciden** con el texto aprobado |
| (2) si el modo del estudio puede incluir el diagrama en el PDF, y como | **SI**: boton `#cm3d-pdfb`, rotulo «Incluir en el PDF», cableado a `cmIncluirPDF()`. `cmPdfSync()` lo **apaga** cuando `_cm3d.modo !== 'estudio'` (aviso `CM_PDF_AVISO.explorar`) o cuando `cmHayCargado()` es falso (aviso `.vacio`), y lo **enciende** en modo `estudio` con algo cargado | **se reproduce**; y ⚠️ el ⓘ ACTUAL dice «no entra al informe ni al PDF», que es **falso** desde PANT-13 |
| (3) si tocar una estructura la vuelve transparente | **SI**: `cmTocar(e)` lanza un rayo sobre `root.children`, y sobre el primer objeto visible con clave hace `_cm3d.sinColor[k] = 1` (o lo borra) y llama a `cmSinColorAplicar()`. El material de «sin color» es `_matSC`, un `ShaderMaterial` con **alfa por pixel** del angulo entre la normal y la camara, `transparent`, `depthWrite:false` y `side: T.FrontSide` | **se reproduce** |

**La linea de abajo.** `cc3dTextoSync()` (107804) escribe en `#cc3d-faltan` por `textContent`,
concatenando con un espacio. Las **seis** formas:

| # | frase | cuando |
|---|---|---|
| 0 | *(cadena vacia)* | `_cm3d.modo === 'explorar'` |
| 1 | `Sin lesiones cargadas que dibujar: se muestra el corazón normal.` | sin nada cargado y sin nada derivado — **medida, textual** |
| 2 | `Cargadas y no dibujadas todavía: <lista>.` | hay secciones encendidas que el modulo no dibuja |
| 3 | `Estenosis pulmonar: falta consignar el nivel en la sección de estenosis pulmonar.` | la estenosis pulmonar sin nivel |
| 4 | `Cargadas con una opción que el dibujo no distingue: <lista>.` | lo omitido por opcion, con los rotulos de `ROT` |
| 5 | `No se dibujan juntas — <motivo> · <motivo>.` | lo que choca por compatibilidad |

**Solo la frase 2 tiene la palabra «todavía»**, y la lista que puede nombrar son **cuatro**
rotulos, medidos y no deducidos: `_CC_SECS` menos `CC3D_DIBUJA` (15 claves) menos `CC3D_PROPIO`
(**vacio**) da exactamente **VAB · MCH · MCA · Marfan/EHAT**. Esa lista **no se toca**.

---

## 11 · (j) El censo de casos viejos, por los LITERALES exactos

Hecho sobre `scripts/test_clinico.mjs` **por frase completa**, con y sin tildes, nunca por
palabras sueltas (la leccion de PANT-24). El dueño de cada aparicion es el ultimo
`caso(` / `casoAbierto(` por encima de su linea.

| literal | casos |
|---|---|
| `sin datos suficientes para graduar la estenosis prot…` | **TC-289** |
| `sin datos suficientes` (mas amplio) | TC-289, **TC-303**, TC-593, TC-705, **TC-757** |
| `normofuncionante` | TC-289 (×16), TC-291, TC-293, **TC-303** (×10), TC-310, TC-331, TC-412, TC-419, TC-504, TC-506, TC-507, TC-753, **TC-757** (×23) |
| `TAVI normofuncionante` | TC-289, TC-753, **TC-757** |
| `hallazgo aislado` | TC-315, TC-480, TC-499, TC-500 |
| `area efectiva no se eval` / `El área efectiva no se eval` | TC-290, TC-291, TC-734 · TC-725 |
| `Desajuste prot` | TC-302, TC-315, TC-474, TC-479, TC-727 |
| `Cargadas y no dibujadas` | **TC-711** |
| `no dibujadas todav` | TC-626, TC-685, TC-689 |
| `cc-3d` | TC-471, TC-500, TC-502, TC-535 |
| `PROT_CAT_TAVI` | **TC-730** |
| `vm-prot-vmax` / `-gmed` / `-thp` / `-eoa` / `-dvi` | TC-474 · TC-474, TC-481 · TC-474 · TC-315, TC-474 · TC-315 |
| `ea-det-sev` | TC-290, TC-291, TC-344, TC-370, TC-371, TC-372, TC-475, TC-479, TC-480, TC-484, TC-485, TC-725, TC-726, TC-734 |
| `posible estenosis` | TC-288, TC-290, TC-291, TC-302, TC-331, TC-425, **TC-723**, TC-724, **TC-758** |
| `ea-prot-ppm` / `ea-prot-sev` | TC-474, TC-727 · TC-474 |
| `vModTrasElegir` · `eaProtEOAz` · `VP_PROT_FUENTE` · `Para TAVI la Tabla 5` | **cero apariciones** |

Los seis que la orden anticipa aparecen: **TC-289**, **TC-303**, **TC-723**, **TC-731**,
**TC-736** y **TC-744** (los tres ultimos por `PROT_CAT_TAVI` / `ea-det-sev` / conteos de
catalogo), mas los de PANT-24 sobre la TAVI normofuncionante: **TC-757** y **TC-758**.

**La base de esos casos se corre antes de tocar la app** y queda guardada, para distinguir un
rojo nuevo de uno heredado.

---

## 12 · Que NO se toca, verificado al abrir

- **Cero** campos guardados nuevos y **cero** columnas de Excel: la base es **457**.
- Los catalogos `PROT_CAT_A4`, `PROT_CAT_TAVI`, `PROT_CAT_A5`, `PROT_CAT_A9`, `PROT_CAT_A7` y
  `PROT_CAT_A8` **no se tocan**, ni las tablas P20-a, P20-b y P20-c.
- La **tricuspide** no se toca: `vtProtObstr`, `vtProtObstrCrit`, `vtProtObstrPintar` y
  `VMOD_POS.vt` quedan como estan.
- El **trombo protesico grande** de la aortica y de la tricuspide no se toca (espera una lectura
  aparte).
- El **Laboratorio**, la sincronizacion y el Excel no se tocan.
- `docs/3d/` solo se lee; `main.vacio` y `Estructura de la app/` no se tocan.
