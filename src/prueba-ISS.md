# Posición de la ISS en tiempo real

### Descripción

Se consulta la API pública de [Where The ISS At?](https://wheretheiss.at) para obtener la posición
actual de la Estación Espacial Internacional, que orbita la Tierra a **7.66 km/s**

### Características
API: Where The ISS At: pública, sin autenticación, HTTPS, sin rate limits estrictos.

```js
// 25544 = id NORAD de la ISS. acá la config va inline (en binance la sacamos a un archivo aparte)
const ISS_API = "https://api.wheretheiss.at/v1/satellites/25544";
const LS_KEY = "iss.intervaloSegundos";

// recordamos el intervalo entre recargas; localStorage da strings -> parseFloat, o 3 por default
const valorGuardado = localStorage.getItem(LS_KEY);
const intervaloInicial = valorGuardado !== null ? parseFloat(valorGuardado) : 3;

// view() pinta el slider y a la vez expone su valor como variable reactiva
const intervaloSegundos = view(Inputs.range([1, 15], {
  label: "Intervalo de polling (segundos)",
  step: 1,
  value: intervaloInicial
}));
```

```js
// persiste el valor al mover el slider
{ localStorage.setItem(LS_KEY, intervaloSegundos.toString()); }
```

```js
const MAX_HISTORIAL = 60;   // cuántos puntos guardamos para la estela

// pide la posición de la ISS cada N seg y publica el estado con notify().
// las vistas (panel, mapa, gráficas, tabla) solo leen estado.actual y estado.historial.
const estado = Generators.observe(notify => {
  let activo = true;
  let historial = [];
  let contadorPolls = 0;

  async function fetchPosicion() {
    if (!activo) return;
    try {
      const respuesta = await fetch(ISS_API);
      const datos = await respuesta.json();

      const punto = {
        // la api manda el timestamp en segundos; Date espera ms, por eso *1000
        timestamp: new Date(datos.timestamp * 1000),
        latitud: datos.latitude,
        longitud: datos.longitude,
        altitud: datos.altitude,
        velocidad: datos.velocity,
        visibilidad: datos.visibility
      };

      // buffer deslizante: metemos el punto nuevo y, si pasamos de 60, tiramos el más viejo
      historial.push(punto);
      if (historial.length > MAX_HISTORIAL) historial.shift();

      contadorPolls++;
      notify({
        actual: punto,
        historial: [...historial],   // snapshot: no queremos pasar la referencia que seguimos mutando
        error: null,
        pollsRealizados: contadorPolls
      });
    } catch (e) {
      notify({
        actual: null,
        historial: [...historial],
        error: e.message,
        pollsRealizados: contadorPolls
      });
    }
  }

  fetchPosicion();
  const id = setInterval(fetchPosicion, intervaloSegundos * 1000);

  // al cambiar el slider esta celda se rehace: matamos el interval viejo
  // o se van acumulando y acabas con varios polls a la vez
  return () => { activo = false; clearInterval(id); };
});
```

```js
// panel: lee de estado y muestra "cargando" hasta que llega la primera lectura
display(html`<div style="font-family: monospace; padding: 1em; background: var(--theme-background-alt); border-radius: 6px;">
  ${estado.actual ? html`
    <strong>Latitud:</strong> ${estado.actual.latitud.toFixed(4)}°<br>
    <strong>Longitud:</strong> ${estado.actual.longitud.toFixed(4)}°<br>
    <strong>Altitud:</strong> ${estado.actual.altitud.toFixed(2)} km<br>
    <strong>Velocidad:</strong> ${estado.actual.velocidad.toFixed(0)} km/h<br>
    <strong>Visibilidad:</strong> ${estado.actual.visibilidad}<br>
    <strong>Polls realizados:</strong> ${estado.pollsRealizados}<br>
    <strong>Puntos en historial:</strong> ${estado.historial.length} / ${60}
  ` : "Cargando primera lectura..."}
  ${estado.error ? html`<br><span style="color: red;"><strong>Error:</strong> ${estado.error}</span>` : ""}
</div>`);
```

```js
// mapa de la trayectoria: el punto actual en rojo, los anteriores son la estela azul.
// las marcas que pueden ser null (línea sin 2 puntos, o sin lectura actual) se quitan con .filter(Boolean)
display(Plot.plot({
  width: 900,
  height: 450,
  projection: "equal-earth",   // proyección geográfica integrada de Plot
  marks: [
    Plot.graticule(),   // rejilla de meridianos y paralelos
    Plot.frame(),
    estado.historial.length > 1 ? Plot.line(estado.historial, {
      x: "longitud",
      y: "latitud",
      stroke: "#2196F3",
      strokeWidth: 2,
      strokeOpacity: 0.6
    }) : null,
    // todos menos el último (el último va aparte, como punto rojo)
    Plot.dot(estado.historial.slice(0, -1), {
      x: "longitud",
      y: "latitud",
      fill: "#2196F3",
      r: 3,
      fillOpacity: 0.5
    }),
    estado.actual ? Plot.dot([estado.actual], {
      x: "longitud",
      y: "latitud",
      fill: "#F44336",
      r: 8,
      stroke: "white",
      strokeWidth: 2
    }) : null
  ].filter(Boolean)
}));
```

```js
// latitud y longitud vs tiempo. ojo: la longitud da un salto de +180 a -180 al cruzar el antimeridiano
display(Plot.plot({
  width: 900,
  height: 300,
  marginLeft: 60,
  marginRight: 80,
  grid: true,
  y: { label: "Grados" },
  x: { label: "Tiempo", type: "time" },
  // leyenda armada a mano: estos colores tienen que coincidir con los stroke de abajo
  color: { legend: true, domain: ["Latitud", "Longitud"], range: ["#FF9800", "#9C27B0"] },
  marks: [
    Plot.ruleY([0]),   // referencia en 0° (ecuador para la latitud)
    Plot.lineY(estado.historial, {
      x: "timestamp",
      y: "latitud",
      stroke: "#FF9800",
      strokeWidth: 2
    }),
    Plot.lineY(estado.historial, {
      x: "timestamp",
      y: "longitud",
      stroke: "#9C27B0",
      strokeWidth: 2
    }),
    Plot.dot(estado.historial.slice(-1), {   // marca el último valor de cada línea
      x: "timestamp",
      y: "latitud",
      fill: "#FF9800",
      r: 5
    }),
    Plot.dot(estado.historial.slice(-1), {
      x: "timestamp",
      y: "longitud",
      fill: "#9C27B0",
      r: 5
    })
  ]
}));
```

```js
// últimas 10 lecturas, más reciente arriba. slice() antes de reverse() porque reverse() muta el arreglo
display(Inputs.table(estado.historial.slice().reverse().slice(0, 10), {
  columns: ["timestamp", "latitud", "longitud", "altitud", "velocidad"],
  header: {
    timestamp: "Hora",
    latitud: "Latitud (°)",
    longitud: "Longitud (°)",
    altitud: "Altitud (km)",
    velocidad: "Velocidad (km/h)"
  },
  format: {
    timestamp: d => d.toLocaleTimeString(),
    latitud: d => d.toFixed(4),
    longitud: d => d.toFixed(4),
    altitud: d => d.toFixed(2),
    velocidad: d => d.toFixed(0)
  }
}));
```
