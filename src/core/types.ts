export type RequirementStatus = "planning" | "developing" | "completed"

export type TaskStatus = "todo" | "in_progress" | "done" | "blocked"

export interface Task {
  id: string
  req_id: string
  title: string
  context_mapping: string[]
  background_chunk: string
  dependencies: string[]
  constraints: string[]
  verification_steps: string[]
  status: TaskStatus
  result_summary?: string
}

export interface Requirement {
  id: string
  title: string
  description: string
  status: RequirementStatus
  tasks: Task[]
}

export interface CommandContext {
  global?: boolean
  cwd?: string
  homeDir?: string
}

export interface UpdateTaskSetPayload {
  title?: string
  context_mapping?: string[]
  background_chunk?: string
  dependencies?: string[]
  constraints?: string[]
  verification_steps?: string[]
  status?: TaskStatus
  result_summary?: string
}

export interface UpdateTaskAddPayload {
  context_mapping?: string[]
  dependencies?: string[]
  constraints?: string[]
  verification_steps?: string[]
}

export interface UpdateTaskRemovePayload {
  context_mapping?: string[]
  dependencies?: string[]
  constraints?: string[]
  verification_steps?: string[]
}

export interface CreateTaskInput {
  id?: string
  req: string
  title: string
  context?: string[]
  tests?: string[]
  constraints?: string[]
  dependencies?: string[]
  background?: string
}

export interface UpdateTaskInput {
  status?: TaskStatus
  summary?: string
  set?: UpdateTaskSetPayload
  add?: UpdateTaskAddPayload
  remove?: UpdateTaskRemovePayload
}
