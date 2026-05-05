# Contributing

Guía para contribuir al repositorio GridEdge.

Reglas básicas
--------------

- Trabajar sobre `dev` y crear ramas `feature/*`, `fix/*`, `hotfix/*` según el
  flujo acordado.
- Antes de abrir PR: ejecutar lint, formateo y tests locales.
- Si usas asistente IA para producir código, debes seguir SPEC y adjuntar los
  artefactos en la PR (`llm_artifacts/...`).

Uso de LLMs y responsabilidad
-----------------------------

Si generas contenido con un LLM (ChatGPT, Claude, Gemini, etc):

1. Sigue la plantilla SPEC para que la salida sea estructurada y verificable.
2. Incluye en el PR: modelo, prompt exacto y archivo `llm_artifacts/` con la
   respuesta cruda.
3. NO aceptar código generado por IA sin revisarlo manualmente: verificar
   seguridad, rendimiento y estilo.

Commits y mensajes
-------------------

Usar Conventional Commits o esquema similar:

- `feat(component): breve descripción`
- `fix(component): breve descripción`
- `docs: actualización de documentación`

Tests y CI
----------

- Añade tests unitarios para cambios relevantes.
- Los PRs deben pasar el workflow CI (lint, tests, build) antes del merge.

Formato y linters
-----------------

- Frontend: usar `eslint` + `prettier` (configurar con `lint-staged` y `husky`).
- Backend: usar `black` y `ruff` si se añade en el futuro.

Revisión de PRs
--------------

- Asignar al menos 1 revisor; para cambios críticos 2 revisores.
- Revisores deben ejecutar los tests y revisar artefactos LLM cuando aplicable.

Plantillas de issues y PR
------------------------

Usar las plantillas en `.github/ISSUE_TEMPLATE/` y `.github/PULL_REQUEST_TEMPLATE.md`.
