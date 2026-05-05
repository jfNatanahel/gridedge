## Descripción breve

Relaciona el PR con el issue SPEC correspondiente (ej. `M-C-01-ybus`).

## SPEC ID

Indicar `SPEC id` o enlace al `.spec.yaml` usado para generar la solución.

## Modelo LLM y prompt (si aplica)

- Modelo usado: 
- Prompt (o enlace a `llm_artifacts/...json`):

## Cambios realizados

- Resumen de archivos modificados / creados.

## Cómo testear localmente

Pasos para reproducir y validar:

```bash
# comandos para compilar / testear
make
cd backend && .venv/bin/python -m pytest
```

## Checklist
- [ ] La salida del LLM fue validada con `scripts/validate_llm_output.py`.
- [ ] Tests pasan localmente.
- [ ] Linter y formateo aplicados.
- [ ] Artefactos LLM incluidos o linkeados en el PR.
- [ ] Revisores asignados.

## Notas adicionales

Agregar cualquier comentario sobre trade-offs, riesgos o pasos pendientes.
