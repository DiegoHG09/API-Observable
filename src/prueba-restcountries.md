# REST Countries 

#### Descripción

Prueba de confirmación que valida la arquitectura Observable + fetch en runtime desplegado en HTTPS. 
Se consulta la API de REST Countries para obtener datos de población y área de todos los países de América, con un filtro interactivo de población mínima. Esta prueba surgió para **descartar que el problema identificado con VizCanvas fuera de Observable** y se confirmó que la **arquitectura funciona correctamente cuando la API también corre en HTTPS.**


#### Características 
API: REST Countries — pública, sin autenticación, HTTPS.

```js
const respuesta = await fetch("https://restcountries.com/v3.1/region/americas")
  .then(r => r.json())
  .catch(err => ({ error: err.message }));

const datos = respuesta.map(pais => ({
  nombre: pais.name.common,
  poblacion: pais.population,
  area: pais.area,
  subregion: pais.subregion || "Otro"
}));
```

```js
const umbral = view(Inputs.range(
  [0, 220000000],
  { label: "Población mínima", step: 1000000, value: 0 }
));
```

```js
const filtrados = datos.filter(d => d.poblacion >= umbral);

display(Plot.plot({
  marginLeft: 140,
  marks: [
    Plot.barX(filtrados, {
      x: "poblacion",
      y: "nombre",
      fill: "subregion",
      sort: { y: "x", reverse: true }
    }),
    Plot.ruleX([0])
  ]
}));
```