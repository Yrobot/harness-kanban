import type { RequirementStatus, TaskStatus } from "@/core/types.js"
import { isReqId, isTaskId } from "@/utils/id.js"

const requirementStatuses: RequirementStatus[] = ["planning", "developing", "completed"]
const taskStatuses: TaskStatus[] = ["todo", "in_progress", "done", "blocked"]

export function assertReqId(reqId: string): void {
  if (!isReqId(reqId)) {
    throw new Error("Invalid requirement id. Expected format YYYYMMDDHHmmss")
  }
}

export function assertTaskId(taskId: string): void {
  if (!isTaskId(taskId)) {
    throw new Error("Invalid task id. Expected format t_000000")
  }
}

export function assertRequirementStatus(status: string): asserts status is RequirementStatus {
  if (!requirementStatuses.includes(status as RequirementStatus)) {
    throw new Error("Invalid requirement status")
  }
}

export function assertTaskStatus(status: string): asserts status is TaskStatus {
  if (!taskStatuses.includes(status as TaskStatus)) {
    throw new Error("Invalid task status")
  }
}

export function assertNonEmpty(value: string, message: string): void {
  if (!value.trim()) {
    throw new Error(message)
  }
}
