# Inventario — un dato, una sola puerta en las congenitas (PANT-14b, commit 2a)

Documento de **solo lectura**: lo escribio el commit 2a de la tanda PANT-14b y no se
vuelve a generar solo. Medido en Chrome con `scripts/_probe_p14b_inv.mjs` y
`scripts/_probe_p14b_puerta.mjs`, sobre el arbol anterior a la tanda y sobre el nuevo.

## Lo primero: las DIECINUEVE secciones tienen interruptor

`_CC_SECS` tiene **19 entradas** y las **19** tienen interruptor de presencia. **Cero**
secciones sin interruptor, asi que no hay ninguna para la que el predicado de datos sea
ya la unica puerta. Y los **19 selects identificatorios tienen su opcion cero VACIA**,
verificado uno por uno: ninguno da verdadero sobre un formulario sin tocar, que es el
defecto que `fop_acv` y `pericardio` ya pagaron en este archivo.

La convencion del nombre es `<k>_incluir_chk`, con **cuatro excepciones** que son las que
la app ya usaba: la CIA y la CIV tienen el suyo propio desde PANT-3 (`ete_cia_activa` y
`ete_civ_activa`, dos checkbox ocultos que se guardan como `<id>__chk`), el ductus se
llama `ductus_incluir_chk` y la coartacion `coart_incluir_chk`.

## La tabla

| k | rotulo | interruptor | campos que la IDENTIFICAN (del `pred` de `_CC_SECS`) |
|---|---|---|---|
| `cia` | CIA | `ete_cia_activa` | `ete_cia_tipo` |
| `civ` | CIV | `ete_civ_activa` | `ete_civ_tipo` |
| `dap` | DAP | `ductus_incluir_chk` | `dap_tipo`, `dap_diam` |
| `vap` | VAP | `vap_incluir_chk` | `vap_tipo`, `vap_diam` |
| `coa` | CoAo | `coart_incluir_chk` | `coa_loc`, `coa_istmo` |
| `fop` | FOP | `fop_incluir_chk` | `fop_tunel`, `fop_asa_mm`, `fop_burbujas` |
| `vab` | VAB | `vab_incluir_chk` | `vab_tipo`, `vab_fenotipo` |
| `ebs` | Ebstein | `ebs_incluir_chk` | `ebs_desplazamiento`, `ebs_area_vd_atrial` |
| `mch` | MCH | `mch_incluir_chk` | `mch_espesor`, `mch_loc` |
| `mca` | MCA | `mca_incluir_chk` | `mca_fenotipo`, `mca_mov_regional`, `mca_tsvd_plax`, `mca_tsvd_psax`, `mca_fac` |
| `tdf` | TdF | `tdf_incluir_chk` | `tdf_func_vd`, `tdf_grad_tsvd` |
| `tga` | TGA | `tga_incluir_chk` | `tga_tipo` |
| `marfan` | Marfan/EHAT | `marfan_incluir_chk` | `marfan_sindrome`, `marfan_ao_seno`, `marfan_ao_ascendente`, `marfan_ita` |
| `eisen` | Eisenmenger | `eisen_incluir_chk` | `eis_lesion_base`, `eis_saturacion_reposo`, `eis_vd_funcion` |
| `fontan` | Fontan | `fontan_incluir_chk` | `fontan_tipo`, `fontan_vs_fevi`, `fontan_saturacion` |
| `esub` | Est. subaortica | `esub_incluir_chk` | `esub_tipo`, `esub_gradiente_medio`, `esub_gradiente_mmhg` |
| `easv` | Est. supravalvular | `easv_incluir_chk` | `easv_tipo`, `easv_gradiente_medio`, `easv_gradiente_mmhg` |
| `dsav` | DSAV | `dsav_incluir_chk` | `dsav_tipo`, `dsav_regurg_av_izq` |
| `cvpa` | CVPA parcial | `cvpa_incluir_chk` | `cvpa_venas_numero`, `cvpa_conexion`, `cvpa_lado` |

## Las cuatro combinaciones, antes y despues

Medido por seccion con el **gesto real**, cargando el dato identificatorio y emitiendo el
informe de verdad. «sw» es el interruptor de presencia.

| k | ANTES: dato cargado | DESPUES: dato cargado | apagado a mano | otro dato identificatorio | estudio viejo (via muda) |
|---|---|---|---|---|---|
| `cia` | sw OFF | sw ON | sw OFF (se respeta) | no tiene otro | sw ON |
| `civ` | sw OFF | sw ON | sw OFF (se respeta) | no tiene otro | sw ON |
| `dap` | sw OFF | sw ON | sw OFF (se respeta) | `dap_diam` -> sw ON | sw ON |
| `vap` | sw OFF | sw ON | sw OFF (se respeta) | `vap_diam` -> sw ON | sw ON |
| `coa` | sw OFF | sw ON | sw OFF (se respeta) | `coa_loc` -> sw ON | sw ON |
| `fop` | sw OFF | sw ON | sw OFF (se respeta) | `fop_asa_mm` -> sw ON | sw ON |
| `vab` | sw OFF | sw OFF | sw OFF (se respeta) | `vab_fenotipo` -> sw ON | sw OFF |
| `ebs` | sw OFF | sw ON | sw OFF (se respeta) | `ebs_area_vd_atrial` -> sw ON | sw ON |
| `mch` | sw OFF | sw ON | sw OFF (se respeta) | `mch_loc` -> sw ON | sw ON |
| `mca` | sw OFF | sw OFF | sw OFF (se respeta) | `mca_mov_regional` -> sw ON | sw OFF |
| `tdf` | sw OFF | sw ON | sw OFF (se respeta) | `tdf_grad_tsvd` -> sw ON | sw ON |
| `tga` | sw OFF | sw ON | sw OFF (se respeta) | no tiene otro | sw ON |
| `marfan` | sw OFF | sw ON | sw OFF (se respeta) | `marfan_sindrome` -> sw ON | sw ON |
| `eisen` | sw OFF | sw ON | sw OFF (se respeta) | `eis_saturacion_reposo` -> sw ON | sw ON |
| `fontan` | sw OFF | sw OFF | sw OFF (se respeta) | `fontan_vs_fevi` -> sw ON | sw OFF |
| `esub` | sw OFF | sw ON | sw OFF (se respeta) | `esub_gradiente_medio` -> sw ON | sw ON |
| `easv` | sw OFF | sw ON | sw OFF (se respeta) | `easv_gradiente_medio` -> sw ON | sw ON |
| `dsav` | sw OFF | sw ON | sw OFF (se respeta) | `dsav_regurg_av_izq` -> sw ON | sw ON |
| `cvpa` | sw OFF | sw ON | sw OFF (se respeta) | `cvpa_venas_numero` -> sw ON | sw ON |

**Las 19 secciones**: el interruptor pasa de **OFF a ON** al cargar el dato, el **apagado a**
**mano se respeta** en las 19, y por la via **muda** -que es el camino de reabrir un estudio
guardado- tambien se enciende, sin que nada reescriba lo guardado.

⚠️ **Las que no tienen «otro dato identificatorio»** son la CIA, la CIV y la TGA: su `pred`
mira **un solo** campo, asi que no hay un segundo valor con el que volver a encenderlas.
Para esas tres, el apagado a mano se deshace volviendo a tocar el boton o cambiando el
valor de ese unico campo.

## Los tres valores de prueba que mi propia sonda tenia mal

`vab_tipo`, `mca_fenotipo` y `fontan_tipo` se midieron primero con un valor que esos
selects **no tienen** -«rl», «clasico» y «ext»-, asi que el dato no se cargaba y las tres
salian «sw OFF» en los dos arboles. No era un defecto de la app: era la sonda. Los valores
buenos son `fused_rl`, `derecho` y `extra`. **Un valor que un select no tiene deja el campo
en cadena vacia**, y eso se lee igual que «la regla no funciona».
