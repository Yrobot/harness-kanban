---
name: harness-kanban
description: Requirement and task management skill, Designed for Harness Code workflows and AI task kanban/context engineering. Use when users ask for 任务管理, 需求拆解, Harness Code 流程, get-task-prompt, 上下文工程, AI 任务看板, or kanban operations via harness-kanban CLI.
---

## Triggers

- Intent Triggers: "When the user asks to start a new feature," "break down requirements," "check project progress," or "prepare the coding environment".
- State Triggers: "Before starting any implementation," "after a successful test/commit," or "when the current conversation context becomes too cluttered".

## Quick Start

```bash
# 1) Create requirement
harness-kanban create-req "User Center" --description "Handle login and registration"

# 2) Create task
harness-kanban create-task \
  --req 20260101120000 \
  --title "API Development" \
  --context "[\"src/api/*\"]" \
  --tests "[\"bun test\"]" \
  --background "Implement user center core API"

# 3) Navigate tasks (progressive disclosure)
harness-kanban list-task --req 20260101120000 --status todo

# 4) Get executable context
harness-kanban get-task-prompt t_000001 --req 20260101120000

# 5) After implementation and verification, write summary (for downstream dependencies)
harness-kanban update-task t_000001 --req 20260101120000 \
  --status done \
  --summary "API implemented, bun test passed"
```

## Decision Tree

- Command parameters, options, examples: read `references/commands.md`
- Requirement / Task types and field semantics: read `references/data-model.md`
- First-time setup, installation, end-to-end flow: read `references/getting-started.md`

## Context Engineering Protocol

The output of `get-task-prompt` contains the 'source of truth' for the current task. If its instructions conflict with previous chat history, prioritize the structured prompt's constraints and validation checklist.

## Anti-Patterns

- Skipping `list-task` and guessing task IDs
- Not writing `--summary` after `update-task` completion
- Passing array fields bare (use JSON strings or comma-separated)
- Adding `--global` when global storage is not needed
- Running `delete-req` without confirming cascade deletion impact

## Error Handling

- If you receive `[NOT_FOUND]`, you must re-run `list-task` to verify the ID; do not attempt to guess it
- If you receive `[INVALID_JSON]`, ensure that `--context` or `--tests` are passed as properly escaped JSON strings
