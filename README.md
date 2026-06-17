# API-Observable

Prueba de concepto para el consumo de APIs externas usando [Observable Framework](https://observablehq.com/framework), con visualización de datos en tiempo real y actualizaciones reactivas sin recargar la página.

## Pruebas incluidas

| Página | API | Descripción |
|---|---|---|
| `prueba-binance` | Binance REST API | Precios de criptomonedas en vivo mediante polling automático |
| `prueba-ISS` | Where The ISS At? | Seguimiento en tiempo real de la Estación Espacial Internacional |

## Hallazgos principales

- Observable puede consumir APIs HTTPS en producción con reactividad completa
- El polling con `Generators.observe` permite actualizaciones en vivo sin rebuilds
- Las APIs HTTP quedan bloqueadas desde páginas servidas en HTTPS (política Mixed Content) — no es una limitación de Observable
- Separar la configuración de la lógica en `src/config/` permite cambiar parámetros sin reconstruir el sitio

## Sitio desplegado

[https://diegohg09.github.io/API-Observable/](https://diegohg09.github.io/API-Observable/)

## Cómo correrlo localmente

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Estructura del proyecto

```
.
├── src/
│   ├── config/
│   │   └── binance.js        # Configuración de la API (URL, símbolos, intervalos)
│   ├── data/                 # Data loaders
│   ├── components/           # Componentes reutilizables
│   ├── prueba-binance.md     # Prueba de polling con Binance
│   ├── prueba-ISS.md         # Prueba de tracking en tiempo real de la ISS
│   └── index.md              # Página de inicio
├── observablehq.config.js    # Configuración del framework
└── package.json
```

## Tecnologías

- [Observable Framework](https://observablehq.com/framework/)
- [Observable Plot](https://observablehq.com/plot/)
- Node.js
