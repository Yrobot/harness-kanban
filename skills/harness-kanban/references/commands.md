# commands.md

harness-kanban CLI command reference (aligned with `src/bin/index.ts`).

## General

Command format: `harness-kanban [action-resource] [...props]`

### Global Flags

- `--help` / `-h`: Show help
- `--version` / `-v`: Show version
- `--global` / `-g`: Use `~/.harness-kanban` as storage root

### Parameter Semantics

- Array fields: JSON string or comma-separated
- Object fields: JSON string

## Requirement Commands

### create-req `<title>`

Initialize a requirement.

Parameters:
- `<title>` (string)
- `--id` (string): `YYYYMMDDHHmmss`
- `--description` (string)

Example:
```bash
harness-kanban create-req "User Center" --id 20260101120000 --description "Handle login and registration"
```

### list-req

List requirements with optional status filter.

Parameters:
- `--status` (string): `planning|developing|completed`

Example:
```bash
harness-kanban list-req --status developing
```

### get-req `<id>`

Get a single requirement's details.

Parameters:
- `<id>` (string)

Example:
```bash
harness-kanban get-req 20260101120000
```

### update-req `<id>`

Update requirement fields.

Parameters:
- `<id>` (string)
- `--status` (string): `planning|developing|completed`
- `--title` (string)
- `--description` (string)

Example:
```bash
harness-kanban update-req 20260101120000 --status developing
harness-kanban update-req 20260101120000 --title "User Center V2" --description "Add user profile and permissions"
```

### delete-req `<id>`

Delete a requirement (cascades to its tasks).

Parameters:
- `<id>` (string)

Example:
```bash
harness-kanban delete-req 20260101120000
```

## Task Commands

### create-task

Create a task under a requirement.

Parameters:
- `--id` (string): `t_000000` (optional)
- `--req` (string): Requirement ID (required)
- `--title` (string): Task title (required)
- `--context` (string): JSON array or comma-separated
- `--tests` (string): JSON array or comma-separated
- `--constraints` (string): JSON array or comma-separated
- `--dependencies` (string): JSON array or comma-separated
- `--background` (string)

Example:
```bash
harness-kanban create-task --req 20260101120000 --title "API Development" --context "[\"src/api/*\"]" --tests "[\"bun test\"]"
harness-kanban create-task --req 20260101120000 --title "API Development" --context "src/api/*,src/shared/*"
```

### list-task

List tasks under a requirement (with optional status filter).

Parameters:
- `--req` (string): Requirement ID (required)
- `--status` (string): `todo|in_progress|done|blocked`

Example:
```bash
harness-kanban list-task --req 20260101120000 --status todo
```

### get-task `<id>`

Get a single task's details.

Parameters:
- `<id>` (string)
- `--req` (string): Requirement ID (required)

Example:
```bash
harness-kanban get-task t_000001 --req 20260101120000
```

### update-task `<id>`

Update task status / summary / fields.

Parameters:
- `<id>` (string)
- `--req` (string): Requirement ID (required)
- `--status` (string): `todo|in_progress|done|blocked`
- `--summary` (string)
- `--set` (string): JSON object
- `--add` (string): JSON object
- `--remove` (string): JSON object

Example:
```bash
harness-kanban update-task t_000001 --req 20260101120000 --status done --summary "API implemented"
harness-kanban update-task t_000001 --req 20260101120000 --add '{"dependencies":["t_000000"]}'
harness-kanban update-task t_000001 --req 20260101120000 --remove '{"constraints":["Do not modify public API"]}'
```

### delete-task `<id>`

Delete a single task.

Parameters:
- `<id>` (string)
- `--req` (string): Requirement ID (required)

Example:
```bash
harness-kanban delete-task t_000001 --req 20260101120000
```

### get-task-prompt `<id>`

Generate a structured execution prompt.

Parameters:
- `<id>` (string)
- `--req` (string): Requirement ID (required)

Example:
```bash
harness-kanban get-task-prompt t_000001 --req 20260101120000
```
