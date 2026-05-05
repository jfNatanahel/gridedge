#!/usr/bin/env python3
"""
scripts/create_issues_from_backlog.py

Create GitHub issues from tasks listed in `SPRINT_BACKLOG.md`.

Usage:
  export GITHUB_TOKEN=ghp_... # personal access token with repo scope
  python scripts/create_issues_from_backlog.py --repo owner/repo --dry-run

The script looks for lines that start with `TAREA ` followed by an identifier
and a colon, e.g. `TAREA M-C-01: Ensamblado de Y-bus` and creates a GitHub
issue for each found task unless an issue with the same title already exists.
"""
from __future__ import annotations

import argparse
import os
import re
import subprocess
import sys
import requests
from typing import List, Tuple, Optional


BACKLOG = "SPRINT_BACKLOG.md"


def parse_backlog(path: str) -> List[Tuple[str, str]]:
    if not os.path.exists(path):
        print(f"Backlog file not found: {path}")
        return []
    tasks = []
    pattern = re.compile(r"^TAREA\s+([A-Z0-9-]+):\s*(.+)$")
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            m = pattern.match(line.strip())
            if m:
                tid = m.group(1).strip()
                desc = m.group(2).strip()
                tasks.append((tid, desc))
    return tasks


def get_repo_from_git() -> Optional[str]:
    try:
        url = subprocess.check_output(["git", "config", "--get", "remote.origin.url"]).decode().strip()
    except Exception:
        return None
    # parse git@github.com:owner/repo.git or https://github.com/owner/repo.git
    if url.startswith("git@"):
        parts = url.split(":", 1)[-1]
    else:
        parts = url.split("github.com/", 1)[-1]
    parts = parts.replace(".git", "")
    return parts


def issue_exists(repo: str, title: str, token: str) -> bool:
    url = f"https://api.github.com/repos/{repo}/issues"
    headers = {"Authorization": f"token {token}", "Accept": "application/vnd.github+json"}
    params = {"state": "all", "per_page": 100}
    try:
        r = requests.get(url, headers=headers, params=params)
        r.raise_for_status()
    except Exception as e:
        print(f"Could not list issues: {e}")
        return False
    for it in r.json():
        if it.get("title", "") == title:
            return True
    return False


def create_issue(repo: str, title: str, body: str, token: str, labels: Optional[List[str]] = None) -> Optional[int]:
    url = f"https://api.github.com/repos/{repo}/issues"
    headers = {"Authorization": f"token {token}", "Accept": "application/vnd.github+json"}
    payload = {"title": title, "body": body}
    if labels:
        payload["labels"] = labels
    r = requests.post(url, json=payload, headers=headers)
    if r.status_code in (200, 201):
        return r.json().get("number")
    else:
        print(f"Failed to create issue {title}: {r.status_code} {r.text}")
        return None


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", help="owner/repo (optional, tries git origin if omitted)")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    repo = args.repo or os.environ.get("GITHUB_REPOSITORY") or get_repo_from_git()
    if not repo:
        print("Repository not specified and could not be inferred from git. Use --repo owner/repo or set GITHUB_REPOSITORY.")
        return 1

    token = os.environ.get("GITHUB_TOKEN")
    if not token and not args.dry_run:
        print("Set GITHUB_TOKEN env var with repo permissions or run with --dry-run")
        return 1

    tasks = parse_backlog(BACKLOG)
    if not tasks:
        print("No tasks found in backlog (pattern 'TAREA <ID>: description')")
        return 0

    for tid, desc in tasks:
        title = f"{tid} - {desc}"
        body = f"Auto-created from SPRINT_BACKLOG.md\n\nTask: {tid}\n\nDescription: {desc}\n"
        print(f"Found task: {title}")
        if args.dry_run:
            print("DRY RUN: would create issue:\n", title)
            continue
        if issue_exists(repo, title, token):
            print("Issue already exists, skipping:", title)
            continue
        num = create_issue(repo, title, body, token, labels=["spec","backlog"])
        if num:
            print(f"Created issue #{num} for {title}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
