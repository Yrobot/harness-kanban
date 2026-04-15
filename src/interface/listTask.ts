import { readRequirement } from "@/core/storage.js"
import { assertReqId, assertTaskStatus } from "@/core/validators.js"
import type { CommandContext, TaskStatus, TaskSummary } from "@/core/types.js"

export interface ListTaskOptions {
  req: string
  status?: string
}

export async function listTask(
  options: ListTaskOptions,
  context: CommandContext = {},
): Promise<TaskSummary[]> {
  assertReqId(options.req)

  const requirement = await readRequirement(context, options.req).catch(() => {
    throw new Error(`Requirement not found: ${options.req}`)
  })

  if (options.status) {
    assertTaskStatus(options.status)
  }
  const status = options.status as TaskStatus | undefined

  const filteredTasks = !status
    ? requirement.tasks
    : requirement.tasks.filter((task) => task.status === status)

  return filteredTasks.map((task) => ({
    id: task.id,
    req_id: task.req_id,
    title: task.title,
    status: task.status,
  }))
}
