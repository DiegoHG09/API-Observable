# Vizcanvas

### Descripción

Prueba de integración con VizCanvas. 
VizCanvas almacena datos en DuckDB y expone una API REST que acepta consultas SQL. La prueba documenta un bloqueador crítico: **el servidor corre en HTTP, lo que impide consumirlo desde una página desplegada en HTTPS por política de seguridad del browser (Mixed Content)**. El mismo error se reprodujo en GitHub Pages y Netlify, confirmando que el problema es estructural y no de configuración.

### Características

API: VizCanvas REST API en HTTP, sin autenticación en endpoints de datos.
Estado: bloqueado en producción hasta que VizCanvas adopte HTTPS.

```js
const resultado = await fetch("http://168.231.75.245:3010/api/query/execute", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ sql: "SELECT * FROM datos_prueba ORDER BY poblacion DESC" })
}).then(r => r.json());

const datos = resultado.rows;
```

```js
const umbral = view(Inputs.range(
  [0, 2000000],
  { label: "Población mínima", step: 10000, value: 0 }
));
```

```js
const filtrados = datos.filter(d => d.poblacion >= umbral);

display(Plot.plot({
  marginLeft: 200,
  marks: [
    Plot.barX(filtrados, {
      x: "poblacion",
      y: "municipio",
      fill: "estado",
      sort: { y: "x", reverse: true }
    }),
    Plot.ruleX([0])
  ]
}));
```