import { readRequirement, saveRequirement } from "@/core/storage.js"
import { assertNonEmpty, assertReqId, assertTaskId } from "@/core/validators.js"
import type { CommandContext, CreateTaskInput, Task } from "@/core/types.js"
import { createTaskId } from "@/utils/id.js"

export async function createTask(
  input: CreateTaskInput,
  context: CommandContext = {},
): Promise<Task> {
  assertReqId(input.req)
  assertNonEmpty(input.title, "Task title is required")

  const requirement = await readRequirement(context, input.req).catch(() => {
    throw new Error(`Requirement not found: ${input.req}`)
  })

  const id = input.id ?? createTaskId(requirement.tasks.map((item) => item.id))
  assertTaskId(id)

  if (requirement.tasks.some((item) => item.id === id)) {
    throw new Error(`Task already exists: ${id}`)
  }

  const task: Task = {
    id,
    req_id: input.req,
    title: input.title.trim(),
    context_mapping: input.context ?? [],
    background_chunk: input.background ?? "",
    dependencies: input.dependencies ?? [],
    constraints: input.constraints ?? [],
    verification_steps: input.tests ?? [],
    status: "todo",
  }

  const updatedRequirement = {
    ...requirement,
    tasks: [...requirement.tasks, task],
  }

  await saveRequirement(context, updatedRequirement)

  return task
}
