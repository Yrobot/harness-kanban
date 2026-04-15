# getting-started.md

harness-kanban first-time installation and onboarding guide (CLI + MCP + Skill).

## 1) Install CLI

### Global install (recommended)

```bash
npm i -g @yrobot/harness-kanban
# or
pnpm add -g @yrobot/harness-kanban
```

### One-off execution (no install)

```bash
npx -y @yrobot/harness-kanban --help
```

## 2) MCP Integration

Configure in MCP-supporting clients (Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "harness-kanban": {
      "command": "npx",
      "args": ["-y", "@yrobot/harness-kanban", "mcp-server"]
    }
  }
}
```

## 3) Install Skill

```bash
npx skills add https://github.com/Yrobot/harness-kanban
```

- The Skill handles AI triggering and routing (when to use which command)
- The CLI handles deterministic execution (create/update/query requirements and tasks)

## 4) End-to-End Loop (CLI)

```bash
# A. Create requirement
harness-kanban create-req "User Center" --id 20260101120000 --description "Handle login and registration"

# B. Create task
harness-kanban create-task \
  --req 20260101120000 \
  --title "API Development" \
  --context "[\"src/api/*\"]" \
  --tests "[\"bun test\"]" \
  --constraints "[\"Do not modify public API protocol\"]" \
  --background "Implement user center core API"

# C. Task navigation (progressive disclosure)
harness-kanban list-task --req 20260101120000 --status todo

# D. Get structured execution prompt
harness-kanban get-task-prompt t_000001 --req 20260101120000

# E. Implement and verify (run code and tests per prompt)

# F. Write back status and delivery summary (for downstream context injection)
harness-kanban update-task t_000001 --req 20260101120000 \
  --status done \
  --summary "API implemented, tests passed, return fields and error codes aligned"
```

## 5) Common Notes

- Always `list-task` before `get-task` / `get-task-prompt` to avoid guessing task IDs
- Always write `--summary` after `update-task` completion — otherwise downstream tasks lack context
- Prefer JSON strings for array fields to avoid shell escaping issues
- `--global` only for cross-project shared kanban scenarios — omit by default
- `delete-req` cascades deletion to tasks — confirm impact before running
