import { findTaskWithRequirement } from "@/core/storage.js"
import { assertTaskId } from "@/core/validators.js"
import type { CommandContext, Task } from "@/core/types.js"

export async function getTask(taskId: string, context: CommandContext = {}): Promise<Task> {
  assertTaskId(taskId)

  const found = await findTaskWithRequirement(context, taskId)

  if (!found) {
    throw new Error(`Task not found: ${taskId}`)
  }

  return found.task
}
