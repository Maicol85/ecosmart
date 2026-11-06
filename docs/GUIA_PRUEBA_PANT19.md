# Guía de prueba manual — tanda PANT-19 (2026-11-06)

Un dato por línea. Abrí `index.html` en Chrome con la ventana en **1440 px** salvo donde se
indique otro ancho.

1. Pestaña **Paciente** → **Peso** `75` · **Talla** `175`.
2. Pestaña **Válvulas** → abrí la sección **Estenosis / Insuficiencia aórtica** tocando su título.
3. **Morfología VA** = `Trivalva normal` → **no tiene que verse** ningún botón a la derecha del selector.
4. **Morfología VA** = `Prótesis mecánica (SAVR)` → a la derecha aparece el botón **Modelo y tamaño**.
5. Tocá **Modelo y tamaño** → se abre una tarjeta titulada **Modelo y tamaño**, y la lista de sugerencias **está cerrada**.
6. En **Modelo** escribí `st` → la lista muestra los **St. Jude Medical** y la parte escrita va resaltada.
7. Mirá debajo de la lista: el enlace **No sé el modelo: ver todos y elegir** **se sigue viendo**, no queda tapado.
8. Borrá y escribí `standard` → tocá **St. Jude Medical Standard · Bileaflet**.
9. **Número (mm)** → elegí `23 mm` → abajo aparecen el gradiente medio esperado **13.4 ± 5.6 mmHg** y la EOA esperada **1.6 ± 0.4 cm²**.
10. En la misma tarjeta, la **EOA indexada predicha** dice **0.84 cm²/m² · moderado**, y al pie **ASE 2024, Tabla A4, hoja 57 (folio 58)**.
11. Tocá **Elegir** → la tarjeta se cierra y el botón ahora dice **St. Jude Medical Standard · 23 mm ▾**.
12. En la fila de morfología se ven tres cuadritos y, debajo, el ASC, el IMC y los cortes aplicados.
13. Tocá **Ocultar** → los cuadritos se van y queda **Mostrar datos esperados**; tocalo y vuelven.
14. Cargá **Ø TSVI** `21` · **VTI TSVI** `18` · **VTI Ao** `60` · **G. medio** `24.5`.
15. Debajo aparece **Medido en este estudio** con el gradiente medio medido y **+2.0 DE respecto del esperado**.
16. Cambiá **G. medio** a `6` → ahora dice **−1.3 DE respecto del esperado** (con el signo menos).
17. **Morfología VA** = `Prótesis biológica (SAVR)` → el modelo **se limpia solo** y el botón vuelve a **Modelo y tamaño**.
18. Tocá **Modelo y tamaño** → **Mi modelo no está: cargar los valores a mano** → cargá gradiente `14` y EOA `1.3` → **Elegir**.
19. El botón dice **Referencia manual ▾** y la línea de abajo empieza con **Referencia manual**.
20. **Morfología VA** = `TAVI` → **Modelo y tamaño** → escribí `sapien 3` → elegilo → **Número (mm)** = `All` → **Elegir**.
21. Entre los cuadritos aparece el **DVI esperado 0.43 ± 0.09**, que es propio de TAVI.
22. Tocá **Modelo y tamaño** → escribí `valve-in-valve` → elegí **SAPIEN 3 valve-in-valve** → el tamaño se completa solo y **Elegir** ya está habilitado.
23. **Morfología VA** = `Prótesis mecánica (SAVR)` → modelo **St. Jude Medical Standard** `23 mm` → **Ø TSVI** `16` · **VTI TSVI** `18` · **VTI Ao** `45` · **Vmax** `4.5` · **G. medio** `38`.
24. Abrí la pastilla **Estenosis** de la válvula aórtica → la tarjeta de severidad dice **Sugiere estenosis protésica significativa**, y en **ⓘ Ver detalle** aparece la desviación del área respecto de la del modelo.
25. Borrá el modelo con **Modelo y tamaño → Quitar modelo** → con los **mismos** datos la tarjeta pasa a **Posible estenosis protésica**: ésa es la única diferencia que esta tanda introduce en el informe.
26. Achicá la ventana a **390 px** → el botón baja a la línea siguiente, la tarjeta se abre como **hoja fija abajo** y **no aparece ninguna barra horizontal**.
