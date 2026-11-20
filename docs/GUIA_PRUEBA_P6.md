# Guía de prueba del PROMPT 6 — contra CeiboLink 1.4.0 real, en Windows

Lo que esta guía prueba es lo único que **no se pudo probar acá**: el conector de verdad, la
animación a ojo y la burbuja en una pantalla real. Todo lo demás está cubierto por los diez casos
nuevos (TC-961 a TC-970) y por la sonda de dos motores.

**Antes de empezar:**

- CeiboLink **1.4.0** instalado (`CeiboLink-1.4.0-windows-x64.exe`). Con un 1.3.x o un 1.2.x la
  mitad de esta guía no aplica: ver el **paso 14**, que es justamente el de la compatibilidad.
- EcoSmart abierto, **Modo Avanzado**, CeiboLink **activado** en ⚙️ Config y **vinculado** con el
  código que muestra el conector.
- El ecógrafo falso (`ecofalso`) en una consola aparte.
- ⚠️ **Mirá la versión en la luz de la cabecera del panel antes de arrancar.** Tiene que decir
  `v1.4.0`. Si dice otra cosa, lo que vas a probar es otro contrato.

---

## 1 · El cartel sale con la PRIMERA imagen, y el número sube

```
ecofalso enviar --nuevos 1
```

**Qué tiene que pasar, en segundos y no en dos minutos:** el cartel «Están llegando imágenes del
ecógrafo» con el dibujo de las imágenes viajando del ecógrafo a la computadora, el contador en
**1**, y los cuatro destinos **apagados**.

Sin cerrar el cartel, mandá dos más:

```
ecofalso enviar --nuevos 2
```

El contador tiene que subir a **3** en el sondeo siguiente —como máximo cuatro segundos— **sin que
el dibujo se reinicie de un salto**. Ésa es la parte que sólo se ve a ojo.

**A los dos minutos de la última**, el cartel pasa a su forma final: el título cambia a «Llegaron
imágenes del ecógrafo», el renglón dice **«Listo: el envío terminó.»**, los cuadraditos se paran
—quietos pero visibles— y los botones se prenden.

⚠️ **Si el contador se queda en 1 y recién a los dos minutos dice 3**, el conector no está mandando
los cuatro campos de la tanda: mirá la versión.

## 2 · La burbuja

Repetí el paso 1 y, **mientras llegan**, cerrá el cartel con la ✕.

- Se achica a una burbuja **abajo a la derecha**, con la misma animación y el número subiendo.
- **No se reabre sola.** Dejala tres o cuatro minutos y fijate que el cartel grande no vuelva.
- Al cerrar la tanda dice **«Llegaron N archivos — tocá para elegir»** y **late despacio** —el mismo
  celeste del botón, cambiando de tonalidad, ciclo de unos 2,6 s—.
- Tocala: abre el cartel grande con los destinos prendidos y la burbuja se va.

**Lo que hay que mirar en una pantalla real:** que no tape ningún botón. Desplazá la página hasta
el final en la pestaña más larga que tengas —Válvulas o el Informe— y fijate que el último botón
quede **por encima** de la burbuja.

**Con «reducir animaciones» del sistema** (Windows: Configuración → Accesibilidad → Efectos
visuales → Efectos de animación, apagado): la burbuja y los cuadraditos tienen que quedar
**quietos pero visibles**. Si desaparecen, es un defecto.

## 3 · El texto cuenta las cuatro clases

```
ecofalso soltar
```

Suelta nueve archivos de cada formato en el buzón, sin un dato de paciente.

El cartel tiene que contar **por separado**: imágenes, cineloops, informes y «archivos que no se
pueden ver». ⚠️ **Lo que NO puede decir es «llegaron 9 imágenes»** — ése es el defecto del 19/11,
con un TXT contado como imagen.

Y el equipo tiene que decir **«Buzón de esta computadora»**, no `BUZON:`.

```
ecofalso soltar --carpeta sonoscape
```

Ahora dice **«Buzón de esta computadora, carpeta «sonoscape»»**.

## 4 · Las imágenes repetidas

1. Esperá un envío y **descartalo** desde el cartel.
2. Volvé a mandar **exactamente las mismas**:
   ```
   ecofalso enviar --mismas
   ```
   (o volvé a soltar los mismos archivos en el buzón)
3. **El cartel tiene que salir otra vez**, y decir que **ya las habías descartado** y que el
   ecógrafo las volvió a mandar.

⚠️ **Y sin recargar la página.** Que hiciera falta recargar era el defecto.

**Con ⚙️ Config abierto**, mirá los tres chips de la tarjeta de CeiboLink: tienen que **moverse
solos** cuando entran imágenes, sin apretar «🔄 Actualizar».

## 5 · Las fotos y los videos que no son DICOM

Para que un video se reproduzca de verdad hacen falta archivos reales:

```
pruebas/armar-medios-de-ejemplo.sh
ecofalso soltar --desde dist/medios-ejemplo --carpeta "el que exporta avi"
```

Son seis: MP4, AVI, WMV, TIF, JPG y PNG.

Tocá **«👁 Vista previa»** en el cartel:

| Formato | Qué tiene que verse en la tira |
|---|---|
| JPG, PNG | la **miniatura de verdad** |
| MP4 | el **primer cuadro** del video |
| AVI, WMV, TIF | el **ícono** y la sigla, con «no se puede ver» en el pie |

⚠️ **Ninguno de los tres últimos puede bajarse**: si el pie dice los MB en vez de la sigla, se
bajó un archivo que no se puede mostrar.

Tocá la miniatura del **JPG**: abre en grande. Tocá la del **MP4**: abre el reproductor, con sus
controles y **sin** el botón «📸 Capturar frame» —mirar no es decidir—.

⚠️ **Lo que NO puede aparecer en ningún momento son estos dos mensajes:** «no tiene la marca
«DICM» en el byte 128» y «el archivo es demasiado corto para ser un DICOM». Ésos eran el defecto.

## 6 · Adjuntar una foto y un video del buzón

Con el JPG y el MP4 del paso 5, probá los tres destinos:

1. **Adjuntar al estudio actual** → aparecen en la pestaña Imágenes. El MP4 como un slot con su
   primer cuadro y su botón de reproducir.
2. **Adjuntar a un estudio guardado** → elegí uno. Abrilo después desde Guardados: la foto y el
   video tienen que estar ahí. ⚠️ **Y los videos que ese estudio ya tenía tienen que seguir.**
3. **Adjuntar a imágenes guardadas** → aparecen en «Imágenes guardadas».

En los tres, CeiboLink tiene que **borrar** lo adjuntado una vez que el estudio se guarda: volvé a
⚙️ Config y mirá que los chips bajen.

## 7 · Los formatos que no se pueden ver

```
ecofalso soltar
```

y descartá todo lo que se pueda ver, dejando sólo los seis que no. O más directo: soltá un TIF
solo.

El cartel tiene que mostrar **una tarjeta con una fila por archivo** —ícono y sigla— la frase
«Esta app puede mostrar DICOM, JPG, PNG, BMP, MP4 y MOV» y **SOLO el botón Descartar**.

⚠️ **Si aparece «Adjuntar al estudio actual», es un defecto.**

Con un grupo **mezclado** (foto + TIF) los tres destinos **sí** tienen que estar, y la tarjeta
lista sólo los que no se pueden ver.

## 8 · Los datos para configurar el ecógrafo

⚙️ Config → CeiboLink → **«Datos para el ecógrafo»**.

- **Todas** las direcciones, cada una con su rótulo: **cable** o **Wi-Fi**.
- ⚠️ **La palabra «desconocido» NO puede aparecer en ninguna parte.**
- Las que no tienen enlace, **más grises y más chicas**, con «Sin cable puesto».
- Las que empiezan con **169.254** al **final** y apagadas, con su explicación.
- El aviso del conector arriba, tal cual.
- Un botón **«Copiar»** en cada valor: probá uno y pegalo en el Bloc de notas.

**Prueba de verdad del rótulo:** desenchufá el cable de red. En el próximo «🔄 Actualizar» esa
dirección tiene que quedar apagada y decir «Sin cable puesto».

## 9 · La carpeta compartida y la contraseña

En el mismo panel, abajo: **«Carpeta compartida, para un equipo que no manda DICOM»** con la ruta
y el usuario, los dos con su botón de copiar, y la frase:

> La contraseña es la que le pusiste a la cuenta **ecografo** cuando la creaste. CeiboLink no la
> guarda ni la puede mostrar.

⚠️ **NO puede haber un campo para escribir la contraseña.** Si hay uno, es un defecto.

Si el conector no tiene carpeta configurada, **el panel entero no se dibuja** — no un panel vacío.

## 10 · El espacio

El aviso de espacio sale cuando el conector lo dice, no cuando EcoSmart calcula un porcentaje.
Para verlo sin llenar el disco, soltá archivos grandes hasta pasar el 80 % del tope:

La tarjeta tiene que decir **el tope que el conector informa** —hoy se deriva del disco, así que
puede ser 50 GB y no 2 GB— y el aviso tiene que nombrar cuánto queda libre.

⚠️ **Si el chip dice «2.0 GB» con un conector 1.4.0, está leyendo un número viejo.**

## 11 · Los nombres donde se aprieta PERMITIR

```
ecofalso soltar --carpeta equipo-nuevo
```

El cartel de equipo nuevo tiene que decir **«Buzón de esta computadora, carpeta «equipo-nuevo»»**
y aclarar que **las copiaste vos**.

Ahora por la carpeta compartida de la red: copiá un archivo a `C:\CeiboLink-Entrada\sonoscape`
**desde otra máquina**. El cartel tiene que decir **«Carpeta de entrada, carpeta «sonoscape»»** y
que **llegaron por la carpeta compartida de la red, no las copiaste vos**.

⚠️ **Ésa es la diferencia que no se puede omitir:** en el buzón escribís vos; en la carpeta de
entrada escribe cualquiera que tenga las credenciales del recurso compartido.

En ⚙️ Config → Equipos, cada fila tiene que llevar su etiqueta: **«copiado a mano»** o **«por
red»**. El AET crudo (`BUZON:`, `ENTRADA:sonoscape`) queda **dentro** del plegable «Apodo y
acciones», rotulado como «Nombre que declara el equipo (AET)».

## 12 · El apodo

Ponele un apodo a uno de los equipos de carpeta: «Sonoscape del consultorio». Desde ahí, el apodo
**manda** sobre el nombre en criollo, en la fila y en el cartel.

## 13 · El sondeo se calla con la pestaña tapada

Con el panel de CeiboLink **a la vista** y el ecógrafo mandando, abrí otra pestaña del navegador y
dejá EcoSmart atrás un minuto. Volvé.

- Mientras EcoSmart está tapado, **no tiene que haber ni un pedido** al puente. Si el puente
  muestra su registro, ahí se ve: cero líneas en ese minuto.
- Al volver, el panel se pone al día **solo** y el cartel sale si entró algo.

Es el arreglo de **P6-j**: hasta el 20/11 el sondeo armaba un repaso del panel cada quince
segundos y ese repaso **disparaba igual** con la pestaña tapada, mandando cuatro pedidos. No era
grave —una ronda a la máquina misma, una sola vez— pero es tráfico que nadie pidió.

## 14 · Lo que no se puede probar sin romper nada

- **Que la contraseña no viaja**: hay una prueba del lado del puente.
- **Que las imágenes en cuarentena no se pueden ver**: autorizá y bloqueá un equipo y fijate que
  el cartel diga que hay que autorizarlo.

## 15 · La compatibilidad, con un conector VIEJO

Si tenés a mano el instalador **1.3.0**, instalalo encima conservando la vinculación y repetí:

| Paso | Qué tiene que pasar con un **1.3.0** |
|---|---|
| 1 | **NO** sale el cartel inmediato. El aviso sale **a los dos minutos** de la última imagen, una sola vez, con el total. Es la regla vieja y es correcta. |
| 2 | **No hay burbuja**: sin cartel de tanda no hay nada que achicar. |
| 3 | El texto **sí** cuenta las cuatro clases: `formato` y `se_puede_ver` son de la 1.3. |
| 5, 6, 7 | **Igual que con el 1.4.0.** |
| 8 | Los rótulos **cable/Wi-Fi** y el apagado **sí** funcionan: son de la 1.3. |
| 9 | La carpeta compartida **sí**. |
| 10 | El aviso de espacio sale por el **85 %** propio, y el tope sigue siendo el del conector. |
| 11 | El nombre en criollo lo arma **EcoSmart** leyendo el prefijo del AET: tiene que decir lo mismo. |

Con un **1.2.1** —el que se probó el 18/11— no hay buzón, ni carpeta de entrada, ni tanda, ni
rótulo de cable: el panel tiene que funcionar igual, con el aviso en el acto y sin un solo error en
la consola.

---

## Si algo falla

Anotá **qué paso**, **qué decía la pantalla** y **la versión de la luz de la cabecera**. Los tres
hacen falta: el mismo síntoma con un 1.3.0 y con un 1.4.0 son dos cosas distintas.
