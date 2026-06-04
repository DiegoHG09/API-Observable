// src/components/grafica-hablantes.js
export function graficaHablantes(datos, {width} = {}) {
  return Plot.plot({
    title: "Hablantes por estado",
    width,
    marks: [
      Plot.barY(datos, {x: "estado", y: "hablantes", fill: "lengua"})
    ]
  });
}

export function graficaTendencia(datos, {width, color} = {}) {
  return Plot.plot({
    width,
    marks: [
      Plot.lineY(datos, {x: "año", y: "hablantes", stroke: color ?? "steelblue"})
    ]
  });
}