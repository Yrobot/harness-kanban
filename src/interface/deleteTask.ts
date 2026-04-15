import { findTaskWithRequirement, saveRequirement } from "@/core/storage.js"
import { assertTaskId } from "@/core/validators.js"
import type { CommandContext } from "@/core/types.js"

export interface DeleteTaskResult {
  id: string
  req_id: string
  deleted: boolean
}

export async function deleteTask(
  taskId: string,
  context: CommandContext = {},
): Promise<DeleteTaskResult> {
  assertTaskId(taskId)

  const found = await findTaskWithRequirement(context, taskId)
  if (!found) {
    throw new Error(`Task not found: ${taskId}`)
  }

  const updatedRequirement = {
    ...found.requirement,
    tasks: found.requirement.tasks.filter((item) => item.id !== taskId),
  }

  await saveRequirement(context, updatedRequirement)

  return {
    id: taskId,
    req_id: found.requirement.id,
    deleted: true,
  }
}
