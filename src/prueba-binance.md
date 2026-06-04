# Polling en tiempo real con Binance

```js
import {binanceConfig} from "./config/binance.js";
```

```js
// PERSISTENCIA EN LOCALSTORAGE — Lectura del valor guardado al cargar
// Usamos una "llave" para identificar este valor específicamente.
// La llave es arbitraria pero conviene usar un formato como
// "namespace.variable" para evitar colisiones si en el futuro
// guardamos más cosas.
const LS_KEY = "binance.intervaloSegundos";

const valorGuardado = localStorage.getItem(LS_KEY);
const intervaloInicial = valorGuardado !== null
  ? parseFloat(valorGuardado)
  : binanceConfig.intervalo.default;

const intervaloSegundos = view(Inputs.range(
  [binanceConfig.intervalo.min, binanceConfig.intervalo.max],
  {
    label: "Intervalo de polling (segundos)",
    step: 1,
    value: intervaloInicial
  }
));
```

```js
// PERSISTENCIA EN LOCALSTORAGE — Escritura cuando cambia el slider
// Esta celda depende de intervaloSegundos. Cada cambio del slider
// guarda el nuevo valor en localStorage. localStorage solo acepta
// strings, por eso convertimos el número con toString().
{
  localStorage.setItem(LS_KEY, intervaloSegundos.toString());
}
```

```js
// Generador
const estado = Generators.observe(notify => {
  let activo = true;
  let datosAnteriores = null;
  let contadorPolls = 0;

  async function fetchDatos() {
    if (!activo) return;
    try {
      const respuesta = await fetch(binanceConfig.apiUrl);
      const todos = await respuesta.json();
      const filtrados = todos
        .filter(t => binanceConfig.simbolos.includes(t.symbol))
        .map(t => {
          const precioActual = parseFloat(t.price);
          const anterior = datosAnteriores?.find(d => d.simbolo === t.symbol);
          return {
            simbolo: t.symbol,
            precio: precioActual,
            precioAnterior: anterior?.precio ?? null,
            cambio: anterior ? precioActual - anterior.precio : 0
          };
        });
      contadorPolls++;
      datosAnteriores = filtrados;
      notify({
        datos: filtrados,
        error: null,
        ultima: new Date(),
        pollsRealizados: contadorPolls
      });
    } catch (e) {
      notify({
        datos: [],
        error: e.message,
        ultima: new Date(),
        pollsRealizados: contadorPolls
      });
    }
  }

  fetchDatos();
  const id = setInterval(fetchDatos, intervaloSegundos * 1000);

  return () => { activo = false; clearInterval(id); };
});
```

```js
// Paneel de estado
display(html`<div style="font-family: monospace; padding: 1em; background: var(--theme-background-alt); border-radius: 6px;">
  <strong>Última actualización:</strong> ${estado.ultima?.toLocaleTimeString() ?? "cargando..."}<br>
  <strong>Polls realizados:</strong> ${estado.pollsRealizados}<br>
  <strong>Polling cada:</strong> ${intervaloSegundos} segundos<br>
  <strong>Símbolos seguidos:</strong> ${binanceConfig.simbolos.length}
  ${estado.error ? html`<br><span style="color: red;"><strong>Error:</strong> ${estado.error}</span>` : ""}
</div>`);
```

```js
// TABLA CON COMPARACIÓN ANTES/DESPUÉS
// Esta es la prueba más clara de que los datos son reales y en vivo:
// muestra el precio anterior, el actual y el cambio entre ambos.
// Si los datos fueran estáticos, la columna de cambio sería siempre 0.
display(Inputs.table(estado.datos, {
  columns: ["simbolo", "precioAnterior", "precio", "cambio"],
  header: {
    simbolo: "Símbolo",
    precioAnterior: "Anterior",
    precio: "Actual",
    cambio: "Δ Cambio"
  },
  format: {
    precio: d => `$${d.toLocaleString("en-US", { minimumFractionDigits: 4 })}`,
    precioAnterior: d => d !== null ? `$${d.toLocaleString("en-US", { minimumFractionDigits: 4 })}` : "—",
    cambio: d => {
      if (d === 0) return "—";
      const flecha = d > 0 ? "▲" : "▼";
      const color = d > 0 ? "#4CAF50" : "#F44336";
      return html`<span style="color: ${color}">${flecha} ${Math.abs(d).toFixed(6)}</span>`;
    }
  }
}));
```

```js
// Gráfica en escala logarítmica
display(Plot.plot({
  marginLeft: 100,
  marginRight: 100,
  x: {
    type: "log",
    label: "Precio USD (escala logarítmica)",
    domain: [0.01, 200000]
  },
  y: { label: null },
  marks: [
    Plot.dot(estado.datos, {
      x: "precio",
      y: "simbolo",
      fill: "simbolo",
      r: 10,
      sort: { y: "x", reverse: true }
    }),
    Plot.text(estado.datos, {
      x: "precio",
      y: "simbolo",
      text: d => `$${d.precio.toFixed(d.precio < 1 ? 4 : 2)}`,
      dx: 15,
      textAnchor: "start",
      fontSize: 11
    })
  ]
}));
```