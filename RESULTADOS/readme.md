# RESULTADOS

## ⚠️ Para resetear resultados.json (borrar datos de prueba)

Reemplazar el contenido de `resultados.json` con:

```json
{
  "ts": 1782308329335,
  "actualizado": "24/6/2026, 8:38:49 a. m.",
  "ranking_instituciones": [ ... ],
  "bracket": {
    "ms_a": null,      ← null porque aún no se ha generado bracket
    "ms_rc": null,
    "bat": null
  },
  "soccer": null,      ← null porque aún no hay torneo generado
  "resultados": {
    "ins": [ ... ],
    "trp_a": [],
    "sl_a": [],
    ...
    "bai": [],
    "dev": [],
    "lk": []
  }
}
```

## Nota
Este archivo es actualizado automáticamente por GAS cada vez que se guarda un resultado.
