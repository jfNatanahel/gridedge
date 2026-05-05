# SPEC — Especificación para trabajo con LLM y reproducibilidad

¿Qué es SPEC?
----------------

SPEC (Standardized Prompt Engineering & Collaboration) es el contrato de trabajo
que el equipo usará cuando se apoye en modelos LLM (ChatGPT, Claude, Gemini, u
otros). SPEC define cómo redactar prompts, el esquema de entrada/salida esperado,
cómo registrar artefactos, y cómo validar automáticamente las respuestas del
modelo. El objetivo es conseguir salidas reproducibles, verificables y auditables
independientemente del modelo usado.

Principios
----------

- Determinismo: preferir temperatura baja (0.0–0.2) y límites de tokens cuando
  se busque código reproducible.
- Estructura: exigir que la salida del modelo siga un esquema JSON/JSONL claro
  para facilitar validación automática.
- Trazabilidad: almacenar prompt y respuesta en `llm_artifacts/` y referenciarlos
  en el PR/issue.
- Verificabilidad: todo resultado propuesto por la IA debe incluir pruebas
  automatizadas o pasos reproducibles para validación manual.

Formato de un SPEC (plantilla)
-----------------------------

Usa este YAML/JSON como plantilla de trabajo para cada tarea que implique un
LLM. Guarda/pega la plantilla en el issue o en un archivo `.spec.yaml` si es
necesario.

Ejemplo (YAML):

```yaml
id: M-C-01-ybus
title: Ensamblado de Y-bus
description: |
  Implementar la función `ybus_build` que construya la matriz de admitancias.
context_files:
  - motor-c/src/network.h
  - motor-c/src/network.c
inputs:
  - name: case_json
    type: file
    path: motor-c/cases/ieee9.json
output_schema: |
  {
    "type": "object",
    "properties": {
      "task_id": {"type": "string"},
      "files": {"type": "array", "items": {"type":"object"}},
      "tests": {"type": "array", "items": {"type":"string"}}
    },
    "required": ["task_id","files"]
  }
prompt_template: |
  SYSTEM: Eres un asistente de desarrollo. Responde SOLO con JSON que cumpla
  exactamente el esquema `output_schema`.
  USER: Implementa `ybus_build` y devuelve parches en formato: {"files":[{path,patch}],"tests": [...]}
model_preferences:
  temperature: 0.0
  max_tokens: 2000
acceptance_criteria:
  - ybus_build compila sin errores
  - Resultado validado contra referencia numérica
tests:
  - make test
  - python backend/test_wrapper.py --case=ieee9

```

Reglas de prompt (obligatorias)
------------------------------

1. Siempre incluir: `SYSTEM` instructions con el propósito y el esquema de salida
   (insistir en que la salida sea JSON). 2. Indicar `temperature: 0.0` para
   pasos de código y cambios exactos. 3. Indicar límite de tokens razonable. 4.
   Pedir al modelo que devuelva un resumen breve en texto aparte sólo si es
   necesario; preferir `llm_artifacts/*.json` con la respuesta cruda para la
   revisión automatizada.

Estructura de artefactos (recomendado)
-------------------------------------

- `llm_artifacts/{issue_id}/{model}-{timestamp}.json` — JSON con campos:
  - `model`, `prompt`, `response`, `validation`.
- `specs/` — especificaciones .yaml opcionales por tarea.

Validación automática
---------------------

Usar `scripts/validate_llm_output.py` para validar que la respuesta del modelo
cumpla el `output_schema`. En los PRs, ejecutar la validación como job de CI
antes de permitir merge.

Buenas prácticas por modelo
---------------------------

- ChatGPT/GPT: usar la función `system` + `assistant` y `temperature=0.0`. Cuando
  esté disponible, preferir la API de funciones para respuestas estructuradas.
- Claude: enviar instrucciones claras de formato y pedir la respuesta en JSON.
- Gemini: aprovechar el control de formato y la opción de output estructurado.

Registro de uso de IA en PRs
---------------------------

Si se usó una IA para generar código o contenido, incluir en el PR:

- Archivo `llm_artifacts/{issue_id}/{model}-{timestamp}.json` con prompt y
  respuesta cruda.
- Campo en el PR template con `Model:` y `Prompt:` (o enlace al artifact).
- Resultado de `scripts/validate_llm_output.py`.

Checklist mínimo para aceptar una entrega generada por IA
--------------------------------------------------------

- [ ] El código compila y los tests pasan en local.
- [ ] La salida del LLM pasó la validación de esquema.
- [ ] Un revisor humano aprobó el cambio y revisó seguridad/privacidad.
- [ ] Los artefactos LLM están incluidos o referenciados en el PR.

Ejemplo de uso rápido
---------------------

1. Crear issue usando `.github/ISSUE_TEMPLATE/SPEC_TEMPLATE.md`.
2. Ejecutar prompt contra el modelo preferido y guardar la respuesta en
   `llm_artifacts/`.
3. Ejecutar `python scripts/validate_llm_output.py --schema code_patch --file llm_artifacts/....json`.
4. Adjuntar artifacts al PR y abrir PR usando la plantilla.

Versionado de SPEC
------------------

Si se cambia la plantilla SPEC (por ejemplo, nuevas claves obligatorias),
versionarla en `docs/SPEC.md` con `spec_version: X.Y` y actualizar la CI para
rechazar artifacts con versión incompatible.
