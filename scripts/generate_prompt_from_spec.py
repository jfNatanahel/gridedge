#!/usr/bin/env python3
"""
Generate a ready-to-paste prompt for Copilot/LLM from a SPEC YAML.

Usage:
  python scripts/generate_prompt_from_spec.py --spec specs/M-C-01.yaml > /tmp/prompt.txt
  # then open /tmp/prompt.txt and paste into Copilot Chat or editor

Requirements:
  pip install pyyaml

The script reads the SPEC YAML and includes the `output_schema`, `prompt_template`
and short context snippets of files listed under `context_files`.
"""
from __future__ import annotations

import argparse
import os
import sys
import textwrap
from typing import List, Optional

try:
    import yaml
except Exception:
    print("PyYAML is required. Install with: pip install pyyaml", file=sys.stderr)
    raise


def extract_yaml_from_markdown(text: str) -> Optional[str]:
    # find the first fenced YAML block
    start = None
    lines = text.splitlines()
    for i, ln in enumerate(lines):
        if ln.strip().startswith("```yaml") or ln.strip().startswith("```yml"):
            start = i + 1
            break
        if ln.strip() == "```":
            # generic fence -- assume YAML if following content looks like key: value
            start = i + 1
            break
    if start is None:
        return None
    out_lines = []
    for ln in lines[start:]:
        if ln.strip() == "```":
            break
        out_lines.append(ln)
    return "\n".join(out_lines)


def load_spec(path: str) -> dict:
    if not os.path.exists(path):
        raise FileNotFoundError(path)
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()
    # try parse as yaml directly
    try:
        return yaml.safe_load(text) or {}
    except Exception:
        # try to extract yaml block from markdown
        body = extract_yaml_from_markdown(text)
        if not body:
            raise
        return yaml.safe_load(body) or {}


def read_file_snippet(path: str, max_lines: int = 20, max_chars: int = 5000) -> str:
    if not os.path.exists(path):
        return f"[file not found: {path}]"
    out = []
    try:
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            for _ in range(max_lines):
                ln = f.readline()
                if not ln:
                    break
                out.append(ln.rstrip('\n'))
    except Exception as e:
        return f"[error reading file {path}: {e}]"
    s = "\n".join(out)
    if len(s) > max_chars:
        s = s[:max_chars] + "\n...[truncated]"
    return s


def build_prompt(spec: dict, snippet_lines: int = 20) -> str:
    lines: List[str] = []
    lines.append("SYSTEM: You are an expert developer assistant.\n")
    # Output schema
    oschema = spec.get("output_schema")
    if oschema:
        lines.append("OUTPUT_SCHEMA (JSON Schema):")
        if isinstance(oschema, (dict, list)):
            import json

            lines.append(json.dumps(oschema, indent=2, ensure_ascii=False))
        else:
            lines.append(str(oschema))
    else:
        lines.append("OUTPUT_SCHEMA: (not provided in SPEC)\nPlease return a JSON object matching the task requirements.")

    lines.append("\nCONTEXT FILES (first %d lines each):" % snippet_lines)
    context_files = spec.get("context_files") or []
    if isinstance(context_files, str):
        context_files = [context_files]
    if context_files:
        for p in context_files:
            p = os.path.normpath(p)
            lines.append(f"--- {p} ---")
            snippet = read_file_snippet(p, max_lines=snippet_lines)
            lines.append("```\n" + snippet + "\n```")
    else:
        lines.append("(no context_files listed in SPEC)")

    # Prompt template
    ptemp = spec.get("prompt_template")
    if ptemp:
        lines.append("\nPROMPT_TEMPLATE:")
        lines.append(ptemp)
    else:
        # build a short default prompt template
        lines.append("\nPROMPT_TEMPLATE (suggested):")
        lines.append(textwrap.dedent("""\
            USER: Implement the requested change. Provide ONLY JSON that matches the OUTPUT_SCHEMA above.
            The JSON must include: `task_id`, `files` (array with {path,patch} entries), and optionally `tests`.
            Return nothing else (no commentary).
        """))

    # model preferences
    mp = spec.get("model_preferences") or {}
    temp = mp.get("temperature", 0.0)
    max_tokens = mp.get("max_tokens", 2000)
    lines.append(f"\nMODEL_PREFERENCES: temperature={temp}, max_tokens={max_tokens}")

    lines.append("\nINSTRUCTIONS FOR THE ASSISTANT:")
    lines.append("- Return EXACTLY one JSON object that validates against the OUTPUT_SCHEMA above.")
    lines.append("- Do NOT include explanatory text or code fences outside the JSON.")
    lines.append("- If you propose file changes, include them under `files` as patches in unified diff format (path + patch).")
    lines.append("- If tests are suggested, list them under `tests` as strings (commands to run).")
    lines.append("\nEND. Reply with JSON only.")

    return "\n\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate a prompt from a SPEC YAML")
    parser.add_argument("--spec", required=True, help="Path to SPEC YAML or docs/SPEC.md")
    parser.add_argument("--lines", type=int, default=20, help="Lines of context to include per file")
    parser.add_argument("--out", help="Output file (default stdout)")
    args = parser.parse_args()

    try:
        spec = load_spec(args.spec)
    except Exception as e:
        print(f"Error loading spec: {e}", file=sys.stderr)
        return 2

    prompt = build_prompt(spec, snippet_lines=args.lines)
    if args.out:
        with open(args.out, "w", encoding="utf-8") as f:
            f.write(prompt)
    else:
        print(prompt)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
