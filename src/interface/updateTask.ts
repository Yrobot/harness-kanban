import { findTaskInRequirement, readRequirement, saveRequirement } from "@/core/storage.js"
import { assertTaskId, assertTaskStatus } from "@/core/validators.js"
import type {
  CommandContext,
  Task,
  UpdateTaskAddPayload,
  UpdateTaskInput,
  UpdateTaskRemovePayload,
} from "@/core/types.js"
import { addUniqueItems, removeItems, setDefinedValue } from "@/utils/object.js"

function applySet(task: Task, setPayload: UpdateTaskInput["set"]): Task {
  if (!setPayload) {
    return task
  }

  let updatedTask = { ...task }

  updatedTask = setDefinedValue(updatedTask, "title", setPayload.title)
  updatedTask = setDefinedValue(updatedTask, "background_chunk", setPayload.background_chunk)
  updatedTask = setDefinedValue(updatedTask, "context_mapping", setPayload.context_mapping)
  updatedTask = setDefinedValue(updatedTask, "dependencies", setPayload.dependencies)
  updatedTask = setDefinedValue(updatedTask, "constraints", setPayload.constraints)
  updatedTask = setDefinedValue(updatedTask, "verification_steps", setPayload.verification_steps)
  updatedTask = setDefinedValue(updatedTask, "result_summary", setPayload.result_summary)

  if (setPayload.status !== undefined) {
    assertTaskStatus(setPayload.status)
    updatedTask = setDefinedValue(updatedTask, "status", setPayload.status)
  }

  return updatedTask
}

function applyAdd(task: Task, addPayload: UpdateTaskAddPayload | undefined): Task {
  if (!addPayload) {
    return task
  }

  return {
    ...task,
    context_mapping: addUniqueItems(task.context_mapping, addPayload.context_mapping),
    dependencies: addUniqueItems(task.dependencies, addPayload.dependencies),
    constraints: addUniqueItems(task.constraints, addPayload.constraints),
    verification_steps: addUniqueItems(task.verification_steps, addPayload.verification_steps),
  }
}

function applyRemove(task: Task, removePayload: UpdateTaskRemovePayload | undefined): Task {
  if (!removePayload) {
    return task
  }

  return {
    ...task,
    context_mapping: removeItems(task.context_mapping, removePayload.context_mapping),
    dependencies: removeItems(task.dependencies, removePayload.dependencies),
    constraints: removeItems(task.constraints, removePayload.constraints),
    verification_steps: removeItems(task.verification_steps, removePayload.verification_steps),
  }
}

export async function updateTask(
  taskId: string,
  reqId: string,
  input: UpdateTaskInput,
  context: CommandContext = {},
): Promise<Task> {
  assertTaskId(taskId)

  const requirement = await readRequirement(context, reqId).catch(() => {
    throw new Error(`Requirement not found: ${reqId}`)
  })
  const task = findTaskInRequirement(requirement, taskId)
  if (!task) {
    throw new Error(`Task not found: ${taskId}`)
  }

  let updatedTask = { ...task }

  if (input.status !== undefined) {
    assertTaskStatus(input.status)
    updatedTask = {
      ...updatedTask,
      status: input.status,
    }
  }

  if (input.summary !== undefined) {
    updatedTask = {
      ...updatedTask,
      result_summary: input.summary,
    }
  }

  updatedTask = applySet(updatedTask, input.set)
  updatedTask = applyAdd(updatedTask, input.add)
  updatedTask = applyRemove(updatedTask, input.remove)

  const updatedRequirement = {
    ...requirement,
    tasks: requirement.tasks.map((item) => (item.id === taskId ? updatedTask : item)),
  }

  await saveRequirement(context, updatedRequirement)

  return updatedTask
}
