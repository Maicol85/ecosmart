# Fichas de los casos TC-595 a TC-600 — tanda POP-C (2026-11-02)

> Seis casos, uno por zona. Los seis **caen contra HEAD por condiciones y ninguno por
> excepción** —95 condiciones en rojo en total—, y los seis sobreviven al barrido de
> **31 mutaciones dirigidas, 31 muertas**.

---

## TC-595 · El selector del tipo de válvula operada

**Qué fija:** que el selector del posoperatorio siga a Válvulas en las cuatro válvulas y en los
dos sentidos, que el papel lea el dueño y nunca el valor viejo, y que `popCxVSync` esté en el
barrido sin escribir un campo del estudio.

| bloque | qué |
|---|---|
| (A0)-(A2) | **denominadores**: los cuatro selectores existen, ofrecen el vacío y las dos prótesis, y las cuatro casillas quedaron marcadas |
| (B1)-(B3) | el sentido **Válvulas → posoperatorio**, al poner, al cambiar y al **sacar** la prótesis — (B3) es el caso que el médico reportó |
| (C1) | el sentido inverso, que ya andaba |
| (D1)-(D3) | el papel dice «sin tipo consignado» sobre una morfología nativa, el selector queda vacío, y **control**: las otras tres siguen diciendo su prótesis |
| (E1)-(E2) | el mecanismo: en `ESPEJOS_VIVOS`, y los cuatro fuera del estudio |
| **(E3)** | **control negativo**: un barrido completo no mueve **ningún** campo del estudio |

**Cae contra HEAD por 4 condiciones.** Lo matan las mutaciones **01** y **02**.

---

## TC-596 · La línea de Marfan y el Z de la raíz

| bloque | qué |
|---|---|
| (A0)-(A3) | los cuatro en «No» dan **una** oración corta, sin ausencias enumeradas ni el rótulo largo |
| (A4) | los cuatro en «Sí», con los de FBN1 **sin** «presente» |
| (A5) | con **una sola** de la pareja en «No», esa ausencia no se escribe |
| **(A6)-(A7)** | **control negativo**: con todo en «—» no se escribe ninguna, **y la línea del score sí está** (el denominador) |
| (B1)-(B3) | las **tres cuentas a mano**, hechas fuera de la página, con tolerancia 1e-9 |
| **(B4)-(B5)** | **controles**: a los 14 no se calcula; sin sexo tampoco, y lo **nombra** |
| (B6) | la superficie corporal es DuBois y **difiere** de la de la app |
| (C1)-(C2) | el manual gana, y el calculado sigue existiendo sin pisarlo |
| **(C3)** | **control negativo**: tras un barrido **completo**, el campo manual sigue vacío |
| (C4)-(C6) | el botón es la única puerta, y la fila dice el método y la salvedad |
| (C7)-(C8) | el papel no nombra a Devereux, ni a DuBois, ni publica el Z |

**Cae contra HEAD por 17 condiciones.** Lo matan las mutaciones **03** a **09**.

---

## TC-597 · La hemodinámica del posoperatorio

| bloque | qué |
|---|---|
| (A1)-(A4) | 2,19 bajo · **2,20 normal** · 2,21 normal, y el corte sale de su constante |
| **(A5)-(A7)** | **controles negativos**: `_icBanda(2.2)` **sigue** diciendo bajo, `FORR_IC_CORTE` no se movió, y por debajo del corte las dos coinciden |
| (A8)-(A9) | el PiCCO en 2,20 y en 2,19, por la fila del gasto |
| (B1)-(B5) | la precarga: sin «adecuada», con el valor, su origen y la salvedad, sin veredicto y en gris |
| **(B6)** | **control negativo**: con 8 y con 22 el color es el **mismo** |
| (C1)-(C2) | el pericardio **enumera** sus signos y, sin el veredicto, el patrón no dice taponamiento |
| **(C3)-(C4)** | con el veredicto, va primero y los signos siguen; y el patrón **sí** lo dice (3d lo protege) |
| (D1)-(D3) | los dos rótulos, y **control**: «Precarga adecuada» ya no está |
| (E1)-(E2) | el globo nombra la sección 6.14 con su folio y explica por qué la precarga no se gradúa |

**Cae contra HEAD por 20 condiciones.** Lo matan las mutaciones **10** a **14**.

---

## TC-598 · Integrar con cualquier dato, y los avisos

| bloque | qué |
|---|---|
| (A1)-(A3) | con el módulo vacío: deshabilitado, **con su motivo**, y `suficiente` en falso |
| (B0)-(B2) | **denominador**: sin peso ni talla **no hay** índice, y aun así `suficiente` es verdadero |
| (B3)-(B6) | el botón habilitado, su globo cambiado, e **integra de verdad**: el bloque y la línea del EN SUMA |
| (C1) | **control negativo**: con el formulario recién limpiado, no hay dato |
| **(C1b)-(C1c)** | **nacieron de la mutación 16**: el espejo de la frecuencia toma el valor y **aun así** el módulo sigue sin datos propios |
| (C2) | con un solo campo cargado, sí |
| (D0)-(D4) | los tres avisos **renderizados** fuera de `.amilo-root`: color, fondo, borde y el **anillo del botón** |
| **(D5)** | **control positivo**: dentro de `.amilo-root` el color es el **mismo** |

**Cae contra HEAD por 13 condiciones.** Lo matan las mutaciones **15** a **18**.

---

## TC-599 · Las válvulas de la demo, los chorros y los catéteres

| bloque | qué |
|---|---|
| (A1) | las constantes de la demo: largo 8 y 72 grados |
| (A2) | los **seis** cruces de tipo × apertura contra la **cuenta a mano de la demo**, con la tolerancia de 0,005 del redondeo |
| (A3)-(A4) | la aórtica abre en sístole y la mitral al revés |
| **(A5)** | **control**: sin fase no hay apertura |
| (B1) | los cuatro grados dan tamaños crecientes |
| (B2)-(B4) | el grado se lee de Válvulas, **incluida la pulmonar, que guarda la PALABRA** |
| **(B5)-(B6)** | **controles**: «Sin insuficiencia» y un campo inexistente valen 0 |
| (B7) | la sincronía: el chorro ocurre con su válvula cerrada |
| (B8) | el texto del esquema los nombra con su grado |
| **(B9)-(B11)** | **controles negativos**: sin grados no hay fila de texto **ni** chorro dibujado |
| (C1)-(C4) | los catéteres según el dispositivo, y el dato viajando por `popEsquema().mon` |

⚠️ **(B11) NACIÓ DE LA MUTACIÓN 23, EN DOS PASOS.** (B9) mira el **texto** y un chorro dibujado
sin grado pasaba igual. Y la primera versión de (B11) **tampoco** la mataba: los chorros son
pulsátiles y una foto cae en un instante al azar. **Se quita la frecuencia** antes de medir, para
que el pintor use la amplitud de reposo y un chorro indebido se dibuje **siempre**.

**Cae contra HEAD por 25 condiciones.** Lo matan las mutaciones **19** a **24**.

---

## TC-600 · Las cavidades, el anillo, los trazados y el PDF

| bloque | qué |
|---|---|
| (A1)-(A4) | la FEVI agranda el VI, el TAPSE el VD y el área la AD |
| **(A2)** | **control**: la FEVI no mueve el VD |
| **(A5)** | **control negativo**: sin esos datos las cuatro vuelven a lo de siempre |
| (A6)-(A8) | el tabique en D en sus **tres** estados, con «No evaluado» dejando el abombamiento por presiones |
| **(B0)** | **control negativo**: sin derrame el anillo no se dibuja |
| (B1)-(B2) | el grosor crece y los tres son **visiblemente** distintos |
| (B3) | la marca del compromiso **suma por encima** |
| (C1)-(C4) | `bump` en su centro y al alejarse, y los **27 y 41 puntos** de los dos trazados de la demo |
| **(C5)** | **control negativo**: sin TAPSE ni ondas, los grupos existen y no se dibujan |
| (D1)-(D3) | la casilla es campo del estudio, con **una** fila en el registro, familia propia y ancho 2 |
| **(D4)-(D7)** | **controles**: sin marcar no hay imagen, el toggle arranca apagado, **no** va a `imgSlots` y **no** agrega columna de Excel |

**Cae contra HEAD por 16 condiciones.** Lo matan las mutaciones **25** a **31**.
