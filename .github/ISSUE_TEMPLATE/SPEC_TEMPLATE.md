---
name: "SPEC Task"
about: "Issue template para tareas definidas con SPEC (LLM-driven tasks)"
title: "[SPEC] - "
labels: [spec, task]
assignees: []
---

## Resumen

<!-- Breve descripción de la tarea -->

## SPEC (pegar o enlazar `.spec.yaml`)

```yaml
# Pegar aquí el SPEC (id, title, description, input_schema, output_schema, prompt_template)
```

## Inputs / Archivos de contexto

- Archivo(s): (ej. `motor-c/cases/ieee9.json`)
- Rutas relevantes:

## Expected output (esquema)

- Insertar o enlazar `output_schema` (JSON Schema o pydantic schema)

## Criterios de aceptación

- [ ] Criterio 1
- [ ] Criterio 2

## Tests / Comandos de validación

- `make test`
- `python scripts/validate_llm_output.py --schema code_patch --file llm_artifacts/ISSUE-xxx/response.json`

## Notas sobre LLM

- Modelos recomendados: (ej. `gpt-4o`, `claude-2`, `gemini-pro`) — indicar
  el modelo a usar y la configuración sugerida (temperature=0.0)

## Asignación

- Responsable: @
- Reviewer sugerido: @
