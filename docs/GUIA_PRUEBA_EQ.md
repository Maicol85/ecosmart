# Guía de prueba manual — tanda EQ (Windows, con el VINNO real)

> Doce pasos. Los seis primeros necesitan el VINNO **por cable directo y por el router**; los
> demás se pueden hacer con cualquier equipo. Anotá al lado lo que ves: si algo no coincide, lo que
> importa es el renglón donde se corta.
>
> **Antes de empezar:** CeiboLink encendido, EcoSmart en **Modo Avanzado** y la pestaña
> ⚙️ Configuración abierta. Si ya tenés los dos «Vinno» viejos en la lista, **dejalos**: el paso 2
> es justamente sobre ellos.

---

## A · Los equipos (lo que el médico reportó)

**1 · Un renglón por equipo.** Abrí ⚙️ Config → CeiboLink → **Equipos**.
→ Esperado: los dos «Vinno» aparecen como **UN** renglón que dice **«2 direcciones»**, con una
línea por dirección. Cada línea muestra la dirección y, debajo o al lado, **«cable directo»**,
**«red del router»** o **«por el cable»** — y si no se puede saber, **sólo la dirección**.
→ El contador del renglón cerrado tiene que decir **«(1 …)»** y no «(2)».

**2 · Los duplicados que ya tenías.** Si los dos «Vinno» quedaron juntos, ya está: eso es
«unirlos». Si querés tratarlos como equipos distintos, tocá **«Separar»** en la línea de una de las
direcciones.
→ Esperado: se parten en dos renglones **y ninguno pierde su permiso** (el que estaba autorizado
sigue autorizado). Volver a juntarlos: abrí «Apodo y acciones» del que separaste y tocá
**«Unir con otro equipo»**.
→ Y si querés tirar la dirección vieja: «Apodo y acciones» → **«Olvidar 192.168.x.x»**. No borra
ninguna imagen.

**3 · El apodo.** Abrí **«Apodo y acciones»** y escribí despacio, durante **más de diez segundos**,
«Vinno del consultorio».
→ Esperado: **se puede escribir**. El plegable no se cierra, el texto no desaparece y el cursor no
se va. Tocá **«Guardar»** → el apodo queda en **las dos direcciones**.
→ Y mirando el panel sin tocar nada: **no tiene que haber ninguna pestañada** cada pocos segundos.

**4 · El mismo equipo desde otra dirección.** Desenchufá el cable, conectá el VINNO **por el
router** (o al revés) y mandá una imagen.
→ Esperado: EcoSmart pregunta **«¿Es el mismo VINNO con otra dirección?»**, diciendo las **dos**
direcciones. **No** tiene que decir «un equipo nuevo».
→ Tocá **«Sí, es el mismo»** → se autoriza y se suma a su renglón, sin volver a pedir permiso.
→ (Si alguna vez es de verdad otro equipo, «No, es otro equipo» lo deja esperando tu decisión.)

**5 · EL CARTEL CON IMÁGENES YA ESPERANDO** (el defecto que reportaste).
Dejá **un** equipo esperando decisión y contestale **«Más tarde»**. Mandá dos imágenes desde el
equipo que **sí** está autorizado.
→ Esperado: dentro de unos segundos sale **«Llegaron 2 imágenes del equipo …»**, **sin** que
tengas que tocar «Ver lo que espera».
→ Antes de esta tanda no salía nunca mientras quedara un equipo pendiente ya avisado.

**6 · La imagen que llega tarde.** Mandá seis imágenes, adjuntalas, y **después** mandá una
séptima del mismo envío.
→ Esperado: el segundo cartel dice **«Llegaron 1 imagen más …»** y, aparte, **«En total hay 7
imágenes esperando de este envío»**. **No** tiene que decir «Llegaron 7».
→ Adjuntá y mirá la biblioteca del estudio: tiene que haber **siete** y no trece.

---

## B · El panel

**7 · Los campos de Ajustes.** Abrí **Ajustes**, borrá el nombre de CeiboLink y escribí otro
**sin guardar**. Esperá veinte segundos.
→ Esperado: lo que escribiste **sigue ahí**. Antes el sondeo lo reemplazaba por el valor guardado
cada cuatro segundos.
→ Cerrá y volvé a abrir el panel → el campo vuelve a mostrar **lo guardado**.

**8 · Lo que abriste se queda abierto.** Abrí «Datos para el ecógrafo» y «Qué hace cada acción» y
dejalos abiertos un minuto.
→ Esperado: **siguen abiertos**.

---

## C · El borrado de a varios

**9 · «Imágenes sin estudio».** Mandá tres o cuatro imágenes y **no** las asignes a ningún estudio.
Andá a 🖼 Imágenes → «Imágenes sin estudio» (o a Guardados → «Sin estudio»).
→ Tildá **«Elegir archivos»** → tocá dos miniaturas (se marcan con un ✓) → **«🗑 Borrar lo
elegido»**.
→ Esperado: **UNA** sola pregunta, que dice **cuántos** se borran. Al aceptar, se van **exactamente
esos dos** y los demás quedan.

**10 · Todas y Ninguna.** Con el modo prendido, tocá **«☑ Todas»** y **«☐ Ninguna»**.
→ Esperado: marca y desmarca lo que está a la vista, igual que en «Imágenes guardadas».

**11 · Borrar varios estudios.** Guardados → **«🗑️ Borrar varios…»**.
→ Esperado: la ventana dice **«los N estudios que el filtro deja ver»** y lista **esos**. Probá
poner un filtro de nombre antes de abrirla: la lista tiene que cambiar con él.
→ Elegí dos → **«🗑 Borrar 2»** → la confirmación dice **cuántos estudios**, **cuántos pacientes
distintos**, que se van también sus imágenes, cineloops y videos, y que **no se puede deshacer**.
→ **Cancelá** la primera vez: no se tiene que borrar nada.

**12 · Y el estudio abierto.** Cargá un estudio, guardalo, y después elegilo en «Borrar varios…».
→ Esperado: la confirmación **avisa** que uno de los elegidos es el que tenés abierto y te dice que
uses «Nuevo estudio» antes de volver a guardar.

---

## Lo que NO se tocó, y conviene confirmar de paso

- La cadencia del sondeo **sigue en cuatro segundos**: no se cambió.
- **Nada se borra en CeiboLink** al adjuntar: eso sigue pasando sólo cuando el estudio se guarda.
- «Eliminar todos» y la papelera de una fila **funcionan igual** que antes.
- El puente (`ecosmart-conector`) **no se tocó**: si algo de arriba falla, es de EcoSmart.
