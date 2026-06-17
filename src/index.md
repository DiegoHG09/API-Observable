---
toc: false
---

<div class="hero">
  <h1>API-Observable</h1>
  <h2>Pruebas de consumo de APIs externas con Observable Framework</h2>
</div>

## ¿Qué es esto?

Este sitio documenta las pruebas de integración entre **Observable Framework** y APIs externas 
con datos en tiempo real. El objetivo es evaluar la viabilidad del framework como capa de 
visualización para el proyecto de análisis de datos del grupo.

## Pruebas disponibles

<div class="grid grid-cols-2">
  <div class="card">
    <h2>Binance — Precios en vivo</h2>
    <p>Polling automático de precios de criptomonedas. Demuestra actualización reactiva 
    de tabla y gráfica sin recargar la página.</p>
    <a href="./prueba-binance">Ver prueba →</a>
  </div>
  <div class="card">
    <h2>ISS — Posición en tiempo real</h2>
    <p>Tracking en vivo de la Estación Espacial Internacional. 
    La posición cambia ~23 km entre cada poll de 3 segundos.</p>
    <a href="./prueba-ISS">Ver prueba →</a>
  </div>
</div>

## Hallazgos clave

- **APIs HTTPS funcionan en producción** sin restricciones desde el browser
- **APIs HTTP quedan bloqueadas** desde sitios HTTPS por política del browser (Mixed Content) — no es una limitación de Observable
- **El polling reactivo** actualiza visualizaciones automáticamente sin rebuild ni recarga
- **Configuración separada del código** permite ajustar parámetros sin reconstruir el sitio

## Repositorio

Código fuente disponible en
[github.com/socialdataibero/api-obs-poc](https://github.com/socialdataibero/api-obs-poc)