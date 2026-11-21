# Guía de prueba manual — P8 (Windows, VINNO real)

Pasos cortos, en orden, para hacer vos con el ecógrafo. Cada uno dice **qué tiene que pasar**.
Si algo no coincide, anotá el paso y qué viste.

> ⚠️ **Antes de empezar:** este árbol **no está pusheado**. Probá la copia local de
> `ecosmart/index.html`, no lo que haya en GitHub Pages.

---

## A · La entrada (1.1)

1. **Con el estudio vacío, mandá 3 imágenes desde el VINNO por cable.** Aceptá el cartel y
   elegí «al estudio abierto».
   → En **Imágenes** tienen que aparecer las 3, cada una con una pastilla **＋ AL PDF** (con
   borde punteado), y el renglón de arriba tiene que decir **«🗂 3 en la biblioteca · 📄 0 en el
   PDF — ninguna sale en el informe todavía»**.
2. **Andá a Informe.**
   → La fila de miniaturas tiene que decir **«🖼️ En el PDF: 0 — el informe va a salir sin
   imágenes»** y mostrar el recuadro punteado que invita a arrastrar.
3. **Generá el PDF.**
   → **No tiene que salir ninguna imagen.** Es el cambio pedido.
4. **Importá 2 fijas del pendrive** («🩻 Importar DICOM»).
   → Igual que el cable: entran a la biblioteca, con pastilla punteada, y el PDF sigue en 0.

## B · Mandar al PDF, sacar, y que no se borre (1.2)

5. **Tocá la pastilla ＋ AL PDF de una imagen.**
   → Se pone **verde, «✓ EN EL PDF»**, el renglón pasa a «📄 1 en el PDF» y en Informe aparece
   su miniatura.
6. **Arrastrá otra imagen de la grilla hasta la fila de miniaturas del Informe.**
   → Al pasar por encima la fila se marca con un borde punteado; al soltar, entra (toast «📄 Al
   PDF») y su pastilla se pone verde.
7. **En Informe, tocá la ✕ de una miniatura.**
   → Sale del PDF, **la imagen sigue en la biblioteca** y su pastilla vuelve a punteada. El
   contador baja.
8. **Volvé a tocar esa pastilla.**
   → Vuelve al PDF. **Esto es lo que antes no se podía** («ya están»).
9. **Tocá «📄 Todas al PDF» y después «🗂 Ninguna al PDF».**
   → Van todas y vuelven todas, y la biblioteca **no pierde ninguna** (el primer número del
   renglón no cambia).
10. **Tocá la ✕ roja de una imagen de la grilla.**
    → **Tiene que preguntar**, y el texto tiene que decir que si lo que querés es sacarla del PDF
    uses la pastilla. Si decís «Cancelar», la imagen sigue.
11. **Guardá el estudio, cerralo y volvé a abrirlo.**
    → Tiene que volver con las mismas en la biblioteca y **las mismas en el PDF** (la decisión se
    guarda).
12. **Abrí un estudio VIEJO, de antes de este cambio, y generá su PDF.**
    → Tiene que salir **igual que siempre**, con todas sus imágenes. Si alguna falta, pará y
    avisá: eso sería una regresión.

## C · Duplicados (1.3)

13. **Mandá las mismas 3 imágenes otra vez desde el VINNO** (o apretá «Ver lo que espera» y
    volvé a adjuntarlas).
    → La biblioteca **sigue en 3, no en 6**, y sale un aviso que dice **«ya estaban en este
    estudio, así que no se duplicaron»** y que se le confirman a CeiboLink al guardar.
14. **Mandá una imagen NUEVA.**
    → Esa sí entra, y **sin** el aviso de repetida.
15. **El caso del router, que es el que medíste:** mandá un envío en el que una imagen llegue
    tarde, de modo que salgan **dos o tres carteles seguidos**. Adjuntá en **todos**.
    → El estudio tiene que quedar con **el total real** (9 si mandaste 9), **no con la suma de
    los carteles** (7+8+9 = 24). Cada cartel que repita algo tiene que decir «ya estaban … no se
    duplicaron».
16. **Guardá el estudio, cerralo, volvé a abrirlo y hacé que el ecógrafo mande el envío COMPLETO
    otra vez.**
    → No tiene que entrar **ninguna** repetida. Esto es lo que antes sí se duplicaba: la marca de
    cada archivo ahora se guarda con el estudio.

## D · Guardar sin documento (1.5)

17. **Con imágenes del ecógrafo adjuntadas, poné solo el nombre (sin documento) y apretá
    «💾 Guardar Informe».**
    → Tiene que salir un **cartel que no se va solo** diciendo que con imágenes del ecógrafo
    hace falta el nombre **y** el documento, cuántas imágenes están esperando en CeiboLink y que
    **no se perdieron**. Al aceptar, el cursor tiene que quedar en el campo del documento.
18. **Cargá el documento y guardá.**
    → Guarda, y las imágenes dejan de estar «esperando» en el panel de CeiboLink.

## E · Borrado de varias (1.4)

19. **Guardados → «Imágenes guardadas» → prendé «Elegir imágenes» → «☑ Todas».**
    → Marca todas las que están **a la vista** y lo dice (un mes plegado no entra).
20. **«🗑 Eliminar las elegidas».**
    → **Una sola** confirmación para todas.
21. **Borrá una imagen, y SIN cerrar la pantalla borrá otra.**
    → Las dos tienen que borrarse. Si alguna no se puede, tiene que decir que la lista estaba
    vieja y que **no se borró ninguna otra en su lugar** — eso es el arreglo: antes borraba la
    equivocada en silencio.

## F · Medir (1.6)

22. **En la grilla de Imágenes, tocá una imagen DICOM.**
    → Tiene que abrir el visor **sin** haber tocado «📏 Medir» antes.
23. **Doble click sobre una imagen.**
    → Tiene que seguir marcándola como **AMPLIADA** (no abrir el visor).

## G · Lo que hay que mirar aparte

24. **El VTI de una fija Doppler del VINNO (1.7).** Trazá la envolvente de **UN SOLO LATIDO** y
    mirá los **ms** que la fila imprime al lado del VTI:
    - si dan **~250-400 ms** y el VTI sigue muy alto → es la escala de tiempo del VINNO, y hace
      falta que me mandes ese `.dcm` para medirlo;
    - si dan **más de 1.000 ms** → el trazo abarcó varios latidos, que es la causa más probable.
    **Anotá el número.** Es el dato que decide, y no se puede sacar sin el archivo.
25. **La «pestañada» de ⚙️ Configuración.** Ahora el sondeo de CeiboLink corre cada **4 s** (el
    build que probaste iba a 15 s), así que la vas a ver **más seguido**. Decime si molesta: lo
    que hay que arreglar es el repintado, no la cadencia.
