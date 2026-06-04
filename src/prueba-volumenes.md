# Prueba — Volúmenes grandes de datos

```js
// CARGA CON MEDICIÓN
// Envolvemos la descarga del CSV en una función que mide cuánto tarda.
// performance.now() devuelve tiempo en milisegundos con alta precisión.
const cargaInicial = await (async () => {
  const t0 = performance.now();
  const datos = await FileAttachment("data/datos_sinteticos.csv").csv({typed: true});
  const t1 = performance.now();
  return {
    datos,
    tiempoDescargaMs: t1 - t0,
    filas: datos.length
  };
})();

const datos = cargaInicial.datos;
```

```js
const umbral = view(Inputs.range(
  [0, 2_000_000],
  { label: "Población mínima", step: 10_000, value: 0 }
));
```

```js
const estadoSeleccionado = view(Inputs.select(
  ["Todos", ...new Set(datos.map(d => d.estado)).values()],
  { label: "Estado" }
));
```

```js
// FILTRO CON MEDICIÓN
// Esta celda se re-ejecuta cada vez que umbral o estadoSeleccionado cambian.
// Cada re-ejecución produce una medición fresca del tiempo de filtrado.
const resultadoFiltrado = (() => {
  const t0 = performance.now();
  const filtrados = datos.filter(d =>
    d.poblacion >= umbral &&
    (estadoSeleccionado === "Todos" || d.estado === estadoSeleccionado)
  );
  const t1 = performance.now();
  return {
    filtrados,
    tiempoFiltroMs: t1 - t0
  };
})();
```

```js
// PANEL DE MÉTRICAS EN VIVO
// Memoria JS heap solo funciona en Chrome/Edge. En otros browsers
// mostramos "no disponible" en lugar de fallar.
display(html`<div style="font-family: monospace; padding: 1em; background: var(--theme-background-alt); border-radius: 6px; line-height: 1.8;">
  <strong style="font-size: 1.1em;">Métricas de rendimiento</strong><br>
  <strong>Filas totales:</strong> ${cargaInicial.filas.toLocaleString()}<br>
  <strong>Tiempo de descarga + parseo:</strong> ${cargaInicial.tiempoDescargaMs.toFixed(1)} ms<br>
  <strong>Filas tras filtrar:</strong> ${resultadoFiltrado.filtrados.length.toLocaleString()}<br>
  <strong>Tiempo del último filtro:</strong> ${resultadoFiltrado.tiempoFiltroMs.toFixed(2)} ms<br>
  <strong>Memoria JS heap:</strong> ${
    performance.memory
      ? `${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1)} MB de ${(performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(0)} MB`
      : "no disponible en este browser"
  }<br>
  <strong>Datos serializados:</strong> ${Math.round(JSON.stringify(datos).length / 1024).toLocaleString()} KB
</div>`);
```

```js
// Histograma — la visualización que estresará a Observable con muchos datos
display(Plot.plot({
  marginLeft: 60,
  marks: [
    Plot.rectY(resultadoFiltrado.filtrados, Plot.binX({y: "count"}, {x: "poblacion", thresholds: 50})),
    Plot.ruleY([0])
  ]
}));
```

```js
display(Inputs.table(resultadoFiltrado.filtrados.slice(0, 100), {
  columns: ["estado", "municipio", "poblacion", "indice_marginacion"]
}));
```