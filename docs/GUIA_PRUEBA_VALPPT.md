# Guía de prueba manual — tanda VAL-PPT (2026-11-02)

Dieciséis pasos, un dato por línea. El ancho de ventana va indicado donde importa.

| # | Dónde | Qué hacer | Qué tiene que verse |
|---|---|---|---|
| 1 | Válvulas → Válvula mitral → **Morfología VM** | Abrir el desplegable | Entre «Prótesis mecánica» y «Endocarditis» aparecen **«Plastia mitral»** y **«TEER mitral»** |
| 2 | Válvulas → Válvula tricúspide → **Morfología VT** | Abrir el desplegable | Entre «Prótesis mecánica» y «Carcinoide» aparecen **«Plastia tricuspídea»** y **«TEER tricuspídeo (T-TEER)»** |
| 3 | Válvulas → Morfología VM | Tocar el **ⓘ** que está al lado del rótulo | Se abre una tarjeta titulada «La plastia y el TEER mitral», con los folios 702 y 450-460, y **sin** ninguna clase ni recomendación |
| 4 | Válvulas → Válvula mitral | Elegir «TEER mitral» y cargar gradiente medio 7 y área 1,5 cm² | La cápsula de estenosis dice **«Estenosis mitral significativa …»**, igual que con una morfología nativa; los campos de PISA y vena contracta siguen visibles |
| 5 | Informe | Generar el informe | El cuerpo dice **«Válvula mitral con reparación transcatéter borde a borde (TEER)»** — con el acrónimo en mayúsculas |
| 6 | Informe → EN SUMA | Con **sólo** la plastia mitral cargada y nada más | El resumen dice **«Válvula mitral con plastia mitral, sin estenosis ni insuficiencia.»** y **ya no** «Estudio sin alteraciones estructurales ni funcionales significativas» |
| 7 | Hemodinámica → Posoperatorio → Cirugía → **Valvular** → **Mitral** | Abrir el desplegable del tipo de esa válvula | Ofrece «— elegir tipo —», las dos prótesis, **«Plastia mitral»** y **«TEER mitral»** |
| 8 | Lo mismo en la **aórtica** y en la **pulmonar** | Abrir los dos desplegables | La aórtica ofrece además **TAVI**; la pulmonar sigue con **sólo** las dos prótesis |
| 9 | Posoperatorio → tipo de la mitral | Elegir «TEER mitral» ahí | La morfología de **Válvulas** queda en «TEER mitral» (los dos sentidos) |
| 10 | Posoperatorio → esquema, con frecuencia cardíaca 80 | Mirar el símbolo de la mitral | Un **círculo verde con dos orificios** a los lados y un **clip** en el medio; los orificios se **encienden y apagan** con el latido |
| 11 | Posoperatorio → esquema | Cambiar la mitral a «Plastia mitral» | El símbolo pasa a un **semicírculo abierto abajo**, verde, sin clip |
| 12 | Posoperatorio → «📋 Características del esquema» | Leer la fila «Cirugía y drenajes» | Dice «válvulas operadas: mitral con **TEER** mitral» — con el acrónimo intacto |
| 13 | ETE → Criterios TEER | Cargar velo anterior 18 mm y área mitral 3,5 cm², y tocar «Integrar al informe» | **En la pantalla** los criterios siguen diciendo «— NO apto»; **en el PDF** la hoja del TEER dice «18mm <20mm» a secas y su conclusión, «5 criterio(s) no cumplido(s)», sin «NO apto» ni «Heart Team» |
| 14 | C. Congénitas → Miocardiopatía hipertrófica | Mirar la fila del conteo de factores | Dice **«AHA/ACC 2024 · factores mayores»** |
| 15 | Guardados → «🖼️ Imágenes guardadas» → **Armar PPT** | Prenderlo y elegir **4 por diapositiva** | Aparece la casilla **«Numerar cada elemento»**, encendida |
| 16 | Lo mismo, con **cuatro clips verticales** elegidos | Generar el PPT | Primero pide el **diseño de fondo**; el mazo abre con «Selección de imágenes — CeiboMed», los cuatro videos salen **en una sola fila** (no en grilla), y cierra con «Gracias» editable |

## Los dos archivos de prueba del bucle

Quedan generados y validados en **~/Desktop/ceibo-ppt-valppt/**:

- **valppt_dos_videos.pptx** (95.656 B) — dos videos en la MISMA diapositiva, los dos con bucle
- **valppt_mezcla.pptx** (86.115 B) — una imagen y un video en la misma diapositiva
- **valppt_sin_bucle.pptx** (95.009 B) — la CAIDA: los dos videos incrustados y SIN arbol de tiempo
 **Esta parte no se puede
automatizar**: hay que abrirlos.

- En **PowerPoint**: abrir el `.pptx`, ir a la diapositiva que tiene los **dos** videos, hacer
  clic en uno — tiene que reproducirse y **volver a empezar solo**, sin parar. Después clic en el
  otro: lo mismo. **No** arrancan los dos con un solo clic, y eso es lo esperado.
- En **Keynote**: abrir el mismo archivo. Keynote no siempre respeta el `repeatCount` de OOXML;
  si el video se reproduce una vez y para, es una limitación de Keynote y no del archivo.
- En los dos: el archivo **no** debe pedir reparación al abrirse.
