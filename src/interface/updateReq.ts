import { readRequirement, saveRequirement } from "@/core/storage.js"
import { assertRequirementStatus, assertReqId } from "@/core/validators.js"
import type { CommandContext, Requirement } from "@/core/types.js"

export interface UpdateReqInput {
  status?: string
  title?: string
  description?: string
}

export async function updateReq(
  id: string,
  input: UpdateReqInput,
  context: CommandContext = {},
): Promise<Requirement> {
  assertReqId(id)

  const requirement = await readRequirement(context, id).catch(() => {
    throw new Error(`Requirement not found: ${id}`)
  })

  if (input.status !== undefined) {
    assertRequirementStatus(input.status)
  }

  const updatedRequirement: Requirement = {
    ...requirement,
    status: input.status ?? requirement.status,
    title: input.title ?? requirement.title,
    description: input.description ?? requirement.description,
  }

  return saveRequirement(context, updatedRequirement)
}
