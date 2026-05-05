# Prompt generation usage

This document explains how to generate a ready-to-paste prompt from a SPEC
YAML using `scripts/generate_prompt_from_spec.py`.

Install dependency:

```bash
python3 -m pip install pyyaml
```

Generate the prompt and open it in the editor:

```bash
python scripts/generate_prompt_from_spec.py --spec specs/M-C-01-ybus.yaml > /tmp/prompt.txt
code /tmp/prompt.txt  # opens in VS Code, copy the content into Copilot Chat
```

If you prefer to paste directly to clipboard (Linux with xclip):

```bash
python scripts/generate_prompt_from_spec.py --spec specs/M-C-01-ybus.yaml | xclip -selection clipboard
```

Use the `.vscode/spec-prompt.code-snippets` snippet to quickly create a prompt
template in a new file: open a new file in VS Code and type `specprompt` then
press Tab to expand.
