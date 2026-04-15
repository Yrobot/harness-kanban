import { findTaskInRequirement, readRequirement } from "@/core/storage.js"
import { assertTaskId } from "@/core/validators.js"
import type { CommandContext, Task } from "@/core/types.js"

export async function getTask(taskId: string, reqId: string, context: CommandContext = {}): Promise<Task> {
  assertTaskId(taskId)

  const requirement = await readRequirement(context, reqId)
  const task = findTaskInRequirement(requirement, taskId)

  if (!task) {
    throw new Error(`Task not found: ${taskId}`)
  }

  return task
}
