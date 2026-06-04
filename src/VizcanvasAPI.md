---
title: VizcanvasAPI (prueba)
draft: false
---

# Vizcanvas API (prueba)

```js
import { getTables, query } from "./vizcanvas.js";

const tablas = await getTables();
const resultado = await query("SELECT * FROM lenguas_indigenas LIMIT 10");

Inputs.table(resultado.rows)
```

/*
import { login, getTables, query } from "./vizcanvas.js";

// Primero haces login
const token = await login("tu_usuario", "tu_contraseña");

// Luego pasas el token a cada función
const tablas = await getTables(token);
const resultado = await query("SELECT * FROM lenguas_indigenas LIMIT 10", token);

Inputs.table(resultado.rows)
*/