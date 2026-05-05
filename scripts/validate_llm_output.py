#!/usr/bin/env python3
"""
scripts/validate_llm_output.py

Validator simple para validar la salida de LLMs contra esquemas pydantic.

Uso:
  python scripts/validate_llm_output.py --schema code_patch --file path/to/resp.json
  cat response.json | python scripts/validate_llm_output.py --schema code_patch

Salida: código de salida 0 si válido, 2 si inválido.
"""
from __future__ import annotations

import argparse
import json
import sys
from typing import List, Optional

from pydantic import BaseModel, ValidationError


class PatchFile(BaseModel):
    path: str
    patch: str


class CodePatchOutput(BaseModel):
    task_id: str
    model: Optional[str]
    prompt: Optional[str]
    files: List[PatchFile]
    tests: Optional[List[str]] = None


class TaskResult(BaseModel):
    task_id: str
    status: str
    details: Optional[dict] = None


SCHEMAS = {
    "code_patch": CodePatchOutput,
    "task_result": TaskResult,
}


def load_json(path: Optional[str]):
    if path:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    else:
        return json.load(sys.stdin)


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate LLM JSON output against simple schemas")
    parser.add_argument("--schema", required=True, choices=list(SCHEMAS.keys()))
    parser.add_argument("--file", help="JSON file path (omit to read stdin)")
    parser.add_argument("--pretty", action="store_true", help="Print parsed object prettily on success")
    args = parser.parse_args()

    data = None
    try:
        data = load_json(args.file)
    except Exception as e:
        print(f"ERROR: could not read JSON input: {e}", file=sys.stderr)
        return 2

    Model = SCHEMAS[args.schema]
    try:
        obj = Model.parse_obj(data)
    except ValidationError as e:
        print("INVALID: schema validation failed", file=sys.stderr)
        print(e.json(), file=sys.stderr)
        return 2

    if args.pretty:
        print(json.dumps(json.loads(obj.json()), indent=2, ensure_ascii=False))
    else:
        print("VALID")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
