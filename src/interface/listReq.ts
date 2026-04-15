import { listRequirements } from "@/core/storage.js"
import { assertRequirementStatus } from "@/core/validators.js"
import type { CommandContext, Requirement, RequirementStatus } from "@/core/types.js"

export interface ListReqOptions {
  status?: string
}

export async function listReq(
  options: ListReqOptions = {},
  context: CommandContext = {},
): Promise<Requirement[]> {
  const requirements = await listRequirements(context)

  if (!options.status) {
    return requirements
  }

  assertRequirementStatus(options.status)
  const status = options.status as RequirementStatus

  return requirements.filter((item) => item.status === status)
}
