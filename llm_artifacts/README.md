# llm_artifacts — almacenamiento de outputs LLM

Lugar donde guardar las respuestas crudas de los LLMs usadas en PRs y issues.

Convención de nombres
- `llm_artifacts/{issue_id}/{model}-{YYYYMMDD-HHMMSS}.json`

Estructura mínima recomendada (JSON):

```json
{
  "task_id": "M-C-01-ybus",
  "model": "gpt-4o",
  "prompt": "...",
  "response": "...",
  "files": [{"path":"motor-c/src/ybus.c","patch":"---\n+++\n..."}],
  "validation": {"schema":"code_patch","valid":true}
}
```

Uso
- Incluir el artifact en el PR o añadir un enlace en el cuerpo del PR.
- La CI ejecuta `python scripts/validate_llm_output.py --schema code_patch --file llm_artifacts/..`.
