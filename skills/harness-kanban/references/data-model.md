# data-model.md

harness-kanban core data models (aligned with README section 3).

## TypeScript Type Definitions

```ts
/** Requirement: defines the overall boundary of a feature */
interface Requirement {
  id: ReqId; // Unique identifier, format YYYYMMDDHHmmss, same as the requirement folder name
  title: string;
  description: string;
  status: "planning" | "developing" | "completed";
  tasks: Task[]; // Tasks stored as an inline array
}

/** Task: the smallest unit for AI execution, implementing context management through attribute definitions */
interface Task {
  id: TaskId; // Format: t_000000, manually assignable; auto-generated if not provided
  req_id: string;
  title: string;

  // --- Strategy: Context Pruning ---
  /** Explicit code paths the Agent must load and perceive */
  context_mapping: string[];

  // --- Strategy: Context Compression ---
  /** Task background, refined by human or Agent */
  background_chunk: string;

  // --- Strategy: Progressive Disclosure ---
  /** Task dependency chain, used to inject required context during prompt assembly */
  dependencies: string[];

  // --- Strategy: Structured Decomposition ---
  /** Explicit execution constraints to converge AI behavior */
  constraints: string[];

  /** Quantified verification steps, defining measurable acceptance criteria */
  verification_steps: string[];

  // --- Status and Output ---
  status: "todo" | "in_progress" | "done" | "blocked";

  /** Delivery summary: structured output summary used as downstream context */
  result_summary?: string;
}
```

## Requirement Storage Structure Example

```json
{
  "id": "20260101120000",
  "title": "User Center",
  "description": "Handle login and registration",
  "status": "developing",
  "tasks": [
    {
      "id": "t_000001",
      "title": "API Development",
      "context_mapping": ["src/api/*"],
      "background_chunk": "...",
      "dependencies": [],
      "constraints": [],
      "verification_steps": [],
      "status": "todo"
    }
  ]
}
```
