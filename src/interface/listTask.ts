import { readRequirement } from "@/core/storage.js"
import { assertReqId, assertTaskStatus } from "@/core/validators.js"
import type { CommandContext, Task, TaskStatus } from "@/core/types.js"

export interface ListTaskOptions {
  req: string
  status?: string
}

export async function listTask(
  options: ListTaskOptions,
  context: CommandContext = {},
): Promise<Task[]> {
  assertReqId(options.req)

  const requirement = await readRequirement(context, options.req).catch(() => {
    throw new Error(`Requirement not found: ${options.req}`)
  })

  if (!options.status) {
    return requirement.tasks
  }

  assertTaskStatus(options.status)
  const status = options.status as TaskStatus

  return requirement.tasks.filter((task) => task.status === status)
}
