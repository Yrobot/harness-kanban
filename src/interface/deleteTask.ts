import { findTaskInRequirement, readRequirement, saveRequirement } from "@/core/storage.js"
import { assertTaskId } from "@/core/validators.js"
import type { CommandContext } from "@/core/types.js"

export interface DeleteTaskResult {
  id: string
  req_id: string
  deleted: boolean
}

export async function deleteTask(
  taskId: string,
  reqId: string,
  context: CommandContext = {},
): Promise<DeleteTaskResult> {
  assertTaskId(taskId)

  const requirement = await readRequirement(context, reqId)
  const task = findTaskInRequirement(requirement, taskId)
  if (!task) {
    throw new Error(`Task not found: ${taskId}`)
  }

  const updatedRequirement = {
    ...requirement,
    tasks: requirement.tasks.filter((item) => item.id !== taskId),
  }

  await saveRequirement(context, updatedRequirement)

  return {
    id: taskId,
    req_id: requirement.id,
    deleted: true,
  }
}
