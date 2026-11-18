# CONTROL_SEVERIDAD_REF — los criterios de severidad que la aplicacion usa hoy

Lo genera `scripts/_gen_sev_ref.py`, que emite tambien el marcado de las TRES fichas que
entraron a Referencias en el punto 6 de la tarea del 18/11. **Ningun corte se toco.**

## Que entro a la aplicacion y que no

Referencias ya publicaba la tabla de cortes de CINCO lesiones nativas -insuficiencia y
estenosis mitral, insuficiencia y estenosis aortica e insuficiencia tricuspidea- y de las
CUATRO posiciones proteticas, con el PPM aortico incluido. Lo que faltaba eran TRES lesiones
sin ficha: **estenosis tricuspidea, estenosis pulmonar e insuficiencia pulmonar**. Esas tres
son las que este script publica.

## Inventario completo

### Estenosis aortica (nativa)

| Criterio | Lo que la app usa | Dueno | Fuente |
|---|---|---|---|
| Vmax | esclerosis <=2,5 · leve 2,6-2,9 · moderada 3,0-3,9 · severa >=4,0 m/s (borde superior exclusivo) | `EA_BANDAS.vmax` | EAE/ASE 2009 (Baumgartner), Tabla 3, folio 10 |
| Gradiente medio | moderada desde 20 · severa desde 40 mmHg, los dos con borde >= | `EA_BANDAS.gmedModMin / gmedSevMin` | EAE/ASE 2009, Tabla 3, folio 10, columna de la AHA/ACC (nota b) |
| AVA | severa <=1,0 · moderada >1,0 y <1,5 cm2; el mismo corte para continuidad y planimetria | `AVA_SEVERA_MAX / avaEsSevera` | EAE/ASE 2009, Tabla 3, folio 10 |
| AVA indexada | severa <=0,60 · moderada <=0,85 cm2/m2 | `EA_AVAI_SEV_MAX / EA_AVAI_MOD_MAX` | ESC/EACTS 2025 el 0,60 · EAE/ASE 2009 Tabla 3 el 0,85 |
| DVI (cociente de velocidades) | severa <0,25 · moderada <=0,50 | `EA_DVI_SEV_MAX / EA_DVI_MOD_MAX` | EAE/ASE 2009, Tabla 3, folio 10 |
| Volumen latido indexado | bajo flujo <=35 ml/m2, el mismo corte para los dos sexos | `UMBRAL_VLI_BAJO` | ESC 2021 / AHA-ACC 2020 |

### Insuficiencia aortica (nativa)

| Criterio | Lo que la app usa | Dueno | Fuente |
|---|---|---|---|
| Vena contracta | leve <3 · moderada 3-6 · severa >6 mm | `tabla de #ref-ia` | ESC 2021 |
| Cociente chorro/TSVI | leve <25 % · moderada 25-64 % · severa >=65 % | `tabla de #ref-ia` | ESC 2021 |
| THP | leve >500 · moderada 200-500 · severa <200 ms | `tabla de #ref-ia` | ESC 2021 |
| EROA y volumen regurgitante | EROA leve <10 · moderada 10-29 · severa >=30 mm2; Vol-R leve <30 · moderada 30-59 · severa >=60 ml | `tabla de #ref-ia` | ESC 2021 |
| Flujo reverso en aorta descendente | velocidad telediastolica >=20 cm/s vota severa; por debajo NO vota | `IA_VMAX_TD_SEVERA` | ESC/EACTS 2025, Figura 4, folio 4659 |

### Estenosis mitral (nativa)

| Criterio | Lo que la app usa | Dueno | Fuente |
|---|---|---|---|
| Area valvular mitral | significativa <=1,5 cm2 | `AVM_SEVERA_MAX` | ASE 2023, Tabla 1, folio 8 |
| Gradiente medio | elevado desde 5 · significativo desde 10 mmHg, los dos con borde >=, a 60-80 lpm | `EM_GMEDIO_ELEVADO_MIN / EM_GMEDIO_SIGNIF_MIN` | ASE 2023, Tabla 1, folio 8 |
| AVm por continuidad: cuando NO vota | con IM o IAo de grado 2 o mas | `EM_CONT_REGURG_MIN` | criterio de la aplicacion |
| AVm por THP: cuando NO vota | solo con IAo severa | `EM_IA_SEVERA_MIN` | criterio de la aplicacion |

### Insuficiencia mitral (nativa)

| Criterio | Lo que la app usa | Dueno | Fuente |
|---|---|---|---|
| Los votantes de la tabla | vena contracta, EROA, volumen regurgitante, fraccion regurgitante y area del chorro | `calcIM_ESC y la tabla de #ref-im` | ESC 2021 / ASE 2017 |
| Onda E | >=120 cm/s APOYA severa; no la gradua | `UMBRAL_ONDA_E_APOYO_IM` | ASE 2017 |
| Cociente VTI mitral/TSVI: cuando NO vota | en valvula nativa solo con IAo severa; en protesis desde la moderada | `IM_RATIO_IA_MAX_NAT / IM_RATIO_IA_MAX_PROT` | criterio de la aplicacion, declarado en IM_RATIO_IA_MOD_TXT |

### Estenosis tricuspidea (nativa)

| Criterio | Lo que la app usa | Dueno | Fuente |
|---|---|---|---|
| Gradiente medio | significativa con mas de 5 mmHg, operador estricto | `ET_CRIT.gmedio` | ESC/EACTS 2025, §12.2, folio 4688 |
| THP | significativa con 190 ms o mas | `ET_CRIT.thp` | EAE/ASE 2009, Tabla 10, folio 19 |
| Area por continuidad | significativa con 1 cm2 o menos | `ET_CRIT.avt` | EAE/ASE 2009, Tabla 10, folio 19 |
| VTI de entrada | significativa con 60 cm o mas | `ET_CRIT.vtiEnt` | ASE 2023 (Pandian), folio 16 |
| Como concluye | BINARIA: significativa o no significativa. La guia no la gradua | `etEstado` | ET_CRIT_FUENTE |

### Insuficiencia tricuspidea (nativa)

| Criterio | Lo que la app usa | Dueno | Fuente |
|---|---|---|---|
| Vena contracta | leve <3 · moderada 3-6,9 · severa >=7 mm | `tabla de #ref-it` | ESC 2021 |
| EROA | leve <20 · moderada 20-39 · severa >=40 mm2 | `tabla de #ref-it` | ESC 2021 |
| Volumen regurgitante | leve <30 · moderada 30-44 · severa >=45 ml | `tabla de #ref-it` | ESC 2021 |

### Estenosis pulmonar (nativa)

| Criterio | Lo que la app usa | Dueno | Fuente |
|---|---|---|---|
| Gradiente maximo | leve <36 · moderada 36-64 · severa >64 mmHg | `EP_GMAX_LEVE_MAX / EP_GMAX_MOD_MAX` | EAE/ASE 2009 folio 20 · ESC 2020 de congenitas folio 436.e46 · ACC/AHA 2025 folio e177 |
| Limite inferior de normalidad | por debajo de 9 mmHg no se informa estenosis | `EP_GMAX_NORMAL_MAX` | CRITERIO DE LA APLICACION: ninguna de las tres publica un limite inferior |

### Insuficiencia pulmonar (nativa)

| Criterio | Lo que la app usa | Dueno | Fuente |
|---|---|---|---|
| THP | por debajo de 100 ms vota severa; 100 o mas no vota | `IP_PHT_SEVERA` | ASE 2019 (Zoghbi), folio 463 |
| Ancho del chorro | angosto leve · intermedio moderada · ancho severa | `IP_ANCHO_GRADO` | categorias de la aplicacion |
| Senal de Doppler continuo | tenue leve · densa variable moderada · densa empinada severa | `IP_SENAL_GRADO` | categorias de la aplicacion |
| Reversion en el tronco distal | presente vota severa | `ipSignos` | territorio de la Tabla 16 |
| Como se combinan | manda el peor de los signos que votan | `ipGradoCalculado / IP_GRADO_PESO` | CRITERIO DE LA APLICACION, declarado en IP_CRIT_FUENTE |

### Protesis aortica

| Criterio | Lo que la app usa | Dueno | Fuente |
|---|---|---|---|
| Vmax | normal hasta 3 · significativa desde 4 m/s (borde >=) | `EA_PROT_CRIT` | ASE 2024, Tabla 5 |
| Cociente AT/ET | normal hasta 0,32 · significativo desde 0,37 | `EA_PROT_CRIT` | ASE 2024, Tabla 5 |
| Gradiente medio (quirurgica) | normal hasta 20 · significativo desde 35 mmHg | `EA_PROT_CRIT` | ASE 2024, Tabla 5 |
| DVI (quirurgica) | normal desde 0,35 (estricto) · significativo hasta 0,25 | `EA_PROT_CRIT` | ASE 2024, Tabla 5 |
| Tiempo de aceleracion | normal por debajo de 80 · posible 80-100 · significativo por encima de 100 ms | `AT_PROT_NORMAL_MAX / AT_PROT_POSIBLE_MAX` | ASE 2024 |
| Volumen sistolico para usar la Vmax | de 50 a 90 mL | `EA_PROT_VS_MIN / EA_PROT_VS_MAX` | ASE 2024, nota ‡ de la Tabla 5 |

### Protesis mitral

| Criterio | Lo que la app usa | Dueno | Fuente |
|---|---|---|---|
| Area efectiva del orificio | obstruccion con 1,0 cm2 o menos | `VM_PROT_EOA_OBSTR_MAX` | ASE 2024 |
| DVI | normal hasta 2,2 · significativo desde 2,5 | `VM_PROT_DVI_NORMAL_MAX / VM_PROT_DVI_SIGNIF_MIN` | ASE 2024 |
| Como concluye | obstruccion con DOS o mas criterios positivos de cuatro | `vmProtVeredicto` | ASE 2024, Tablas 11 y 12 |

### Protesis tricuspide

| Criterio | Lo que la app usa | Dueno | Fuente |
|---|---|---|---|
| Los cortes | los de la Tabla 19 de la ASE 2024 | `VT_PROT_T19` | ASE 2024, Tabla 19, hoja 35, folio 36 |
| Como concluye | obstruccion con DOS o mas criterios positivos | `vtProtVeredicto` | ASE 2024 |

### Protesis pulmonar

| Criterio | Lo que la app usa | Dueno | Fuente |
|---|---|---|---|
| Los cortes | los de la Tabla 15 de la ASE 2024 | `VP_PROT_T15` | ASE 2024, Tabla 15, hoja 32, folio 33 |
| Como concluye | tres estados, y NO gradua | `vpProtVeredicto` | ASE 2024 |

### Desajuste protesis-paciente (PPM)

| Criterio | Lo que la app usa | Dueno | Fuente |
|---|---|---|---|
| Aortico, IMC por debajo de 30 | normal >0,85 · moderado 0,85-0,66 · severo <=0,65 cm2/m2 | `_eaPpmAoClasificar / EA_PROT_PPM_CORTES` | ASE 2024, Tabla 7, folio 20 |
| Aortico, IMC de 30 o mas | normal >0,70 · moderado 0,70-0,56 · severo <=0,55 cm2/m2 | `_eaPpmAoClasificar / EA_PROT_PPM_CORTES` | ASE 2024, Tabla 7, folio 20 |
| Mitral | los cortes de la misma Tabla 7, con la misma rama de IMC | `_vmPpmClasificar / VM_PROT_PPM_CORTES` | ASE 2024, Tabla 7 |
| Tricuspide y pulmonar | NO publican PPM: la Tabla 7 no abre esas dos posiciones | `VMOD_POS.vt.ppm y .vp.ppm en null` | ASE 2024, Tabla 7 |
| Condicion para publicar el desajuste con un modelo cargado | lo medido tiene que caer dentro de 1 desvio del area esperada | `vModSync` | ASE 2024, nota al pie de la Tabla 7, folio 20 |

## Diferencias entre lo que la aplicacion usa y lo que dice la guia (11)

**Nada de esto se escribe en la aplicacion.** La orden lo manda a este documento y al
reporte, y la regla fija del 2026-11-04 prohibe que un texto de la aplicacion diga que dos
fuentes no coinciden. **Ningun corte se cambio.**

| Fila | Valor de la app | Valor de la fuente | Que se hizo |
|---|---|---|---|
| Estenosis aortica · gradiente medio | moderada desde 20 y severa desde 40 mmHg | la columna de la ESC de la MISMA fila de la Tabla 3 corre los tres a <30, 30-50 y >50 | la aplicacion usa la columna de la AHA/ACC (nota b) y lo DICE en su ficha de Referencias |
| Estenosis aortica · AVA indexada severa | <=0,60 cm2/m2, el 0,60 exacto del lado severo | la Tabla 3 de la EAE/ASE 2009 escribe <0,6 | gana la guia vigente, la ESC/EACTS 2025 |
| Estenosis aortica · DVI severo | <0,25, estricto | las dos fuentes escriben el corte severo estricto; el 0,25 exacto es MODERADA | coinciden |
| Estenosis tricuspidea · gradiente medio | >5 mmHg, estricto | la ASE 2023 y la EAE/ASE 2009 escriben >=5 mmHg | la diferencia alcanza a UN valor, el 5,0 exacto, y gana la guia de 2025 |
| Estenosis mitral · AVm | <=1,5 cm2 significativa | la ESC/EACTS 2021 usa el mismo corte y lo llama «clinicamente significativa (moderada o severa)» | mismo numero, otro nombre; la ficha de Referencias ya lo dice |
| Insuficiencia mitral · cociente VTI mitral/TSVI | en valvula nativa el cociente se retira solo con IAo severa | la ASE 2023 lo retira desde la IAo moderada | la divergencia esta declarada en el codigo (IM_RATIO_IA_MOD_TXT) y NO se corrigio: es contenido clinico |
| Estenosis pulmonar · limite inferior | por debajo de 9 mmHg no se informa estenosis | ninguna de las tres fuentes publica un limite inferior de normalidad | declarado como criterio de la aplicacion en la tarjeta y ahora tambien en su ficha |
| Insuficiencia pulmonar · integracion de los cuatro signos | manda el peor de los signos que votan | ninguna guia publica una escala que combine los cuatro | declarado como criterio de la aplicacion en IP_CRIT_FUENTE y ahora en su ficha |
| Protesis aortica · DVI normal | desde 0,35, estricto | la Figura 13 de la misma guia usa 0,30 | queda como esta: es un corte clinico y lo decide el medico |
| Protesis aortica · Tabla 6 (deterioro) | no implementada | la Tabla 6 compara contra un basal posterior al implante | la aplicacion gradua obstruccion, no deterioro; declarado en el mapa de valvulas |
| Protesis mitral · cortes del PPM | los de la Tabla 7 por la rama de IMC | el mapa de constantes marcaba VM_PROT_PPM_CORTES como «definicion vista, valores no leidos» | desde la PANT-20 el dueno es _vmPpmClasificar, extraido de vmProtEOA; la verificacion del valor sigue pendiente y queda REPORTADA |

## Lo que quedo AFUERA de la aplicacion, con su motivo (4)

- **Las cinco fichas de severidad que ya existian -insuficiencia y estenosis mitral, insuficiencia y estenosis aortica e insuficiencia tricuspidea-** — ya publican su tabla de cortes con la fuente atribuida fila por fila. Reescribirlas para ponerles la linea de 10 px al pie seria tocar texto clinico ya verificado sin agregar un dato, asi que se dejaron como estan y se declara.
- **Las cuatro fichas de protesis y el PPM aortico** — ya publican sus cortes: la aortica con la Tabla 5 y el PPM de la Tabla 7, la mitral con sus cuatro criterios, y la tricuspide y la pulmonar con las Tablas 19 y 15 desde la PANT-20.
- **Toda diferencia entre lo que la aplicacion usa y lo que dice la guia** — la orden lo prohibe en la aplicacion: va solo en este documento y en el reporte.
- **Las bandas de plausibilidad (DCM_RANGO, LAB_XLS_RANGO_PROPIO y CHM_RANGO)** — no son criterios de severidad: atrapan el error de un orden de magnitud. Su inventario vive en docs/mapa/valvulas-constantes.md.
