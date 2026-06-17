# Polling en tiempo real con Binance

<div class="hero">
  <h1>Polling en tiempo real con Binance</h1>
</div>

#### Descripción

Prueba de consumo de API pública en tiempo real mediante un polling automático.
Se consulta la API REST de Binance cada N segundos configurable por el usuario desde un slider (por el momento) para obtener precios actuales de criptomonedas. Esta prueba **demuestra que Observable puede mostrar datos que cambian constantemente sin recargar la página ni reconstruir el sitio**. Como nota adicional: *El intervalo de actualización se persiste localmente en el browser mediante localStorage.*

#### Características 
API: Binance REST API — pública, sin autenticación, HTTPS.

```js
// url, símbolos e intervalos viven en config aparte
import {binanceConfig} from "./config/binance.js";
```

```js
// recordamos el intervalo elegido entre recargas con localStorage
const LS_KEY = "binance.intervaloSegundos";

// localStorage guarda strings (o null la 1ra vez) -> parseamos o usamos el default
const valorGuardado = localStorage.getItem(LS_KEY);
const intervaloInicial = valorGuardado !== null
  ? parseFloat(valorGuardado)
  : binanceConfig.intervalo.default;

// view() mostramos el slider y expone su valor como variable reactiva a la vez
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
// guarda el valor cada vez que se mueve el slider (toString xq localStorage es string)
{
  localStorage.setItem(LS_KEY, intervaloSegundos.toString());
}
```

```js
// pide precios a Binance cada N seg y publica el estado con notify().
// cada notify() refresca el panel, la tabla y la gráfica.
// `estado.datos` es lo único que consumen las vistas -> es el dato a exponer
const estado = Generators.observe(notify => {
  let activo = true;
  let datosAnteriores = null;   // para sacar el cambio contra el poll anterior
  let contadorPolls = 0;

  async function fetchDatos() {
    if (!activo) return;
    try {
      const respuesta = await fetch(binanceConfig.apiUrl);
      const todos = await respuesta.json();
      // Binance regresa todos los pares; filtramos los de la config
      // TODO: pedir solo los nuestros con ?symbols= para no bajar todo
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
      // si truena la red, publicamos el error en vez de romper la página
      notify({
        datos: [],
        error: e.message,
        ultima: new Date(),
        pollsRealizados: contadorPolls
      });
    }
  }

  fetchDatos();   // primera llamada ya, sin esperar el intervalo
  const id = setInterval(fetchDatos, intervaloSegundos * 1000);

  // al mover el slider esta celda se rehace: hay que "matar" el interval viejo
  // o se van acumulando y acabas con varios polls corriendo a la vez
  return () => { activo = false; clearInterval(id); };
});
```

```js
// panel de estado, solo lee de `estado`
display(html`<div style="font-family: monospace; padding: 1em; background: var(--theme-background-alt); border-radius: 6px;">
  <strong>Última actualización:</strong> ${estado.ultima?.toLocaleTimeString() ?? "cargando..."}<br>
  <strong>Polls realizados:</strong> ${estado.pollsRealizados}<br>
  <strong>Polling cada:</strong> ${intervaloSegundos} segundos<br>
  <strong>Símbolos seguidos:</strong> ${binanceConfig.simbolos.length}
  ${estado.error ? html`<br><span style="color: red;"><strong>Error:</strong> ${estado.error}</span>` : ""}
</div>`);
```

```js
// tabla que muestra los cambios anterior vs actual
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
// escala log en x: van de centavos a decenas de miles ya que si lo hacemos
// en lineal, los más bajos no se apreciarína
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

<style>
  .observablehq--block {
    max-width: 100%;
  }
</style>
