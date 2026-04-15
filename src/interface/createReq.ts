import { createReqId } from "@/utils/id.js"
import { assertNonEmpty, assertReqId } from "@/core/validators.js"
import { requirementExists, saveRequirement } from "@/core/storage.js"
import type { CommandContext, Requirement } from "@/core/types.js"

export interface CreateReqOptions {
  id?: string
  description?: string
}

export async function createReq(
  title: string,
  options: CreateReqOptions = {},
  context: CommandContext = {},
): Promise<Requirement> {
  assertNonEmpty(title, "Requirement title is required")

  const id = options.id ?? createReqId()
  assertReqId(id)

  if (await requirementExists(context, id)) {
    throw new Error(`Requirement already exists: ${id}`)
  }

  const requirement: Requirement = {
    id,
    title: title.trim(),
    description: options.description?.trim() ?? "",
    status: "planning",
    tasks: [],
  }

  return saveRequirement(context, requirement)
}
