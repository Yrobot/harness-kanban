import { listRequirements } from "@/core/storage.js"
import { assertRequirementStatus } from "@/core/validators.js"
import type {
  CommandContext,
  RequirementStatus,
  RequirementSummary,
} from "@/core/types.js"

export interface ListReqOptions {
  status?: string
}

export async function listReq(
  options: ListReqOptions = {},
  context: CommandContext = {},
): Promise<RequirementSummary[]> {
  const requirements = await listRequirements(context)

  if (options.status) {
    assertRequirementStatus(options.status)
  }
  const status = options.status as RequirementStatus | undefined

  const filteredRequirements = !status
    ? requirements
    : requirements.filter((item) => item.status === status)

  return filteredRequirements.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    status: item.status,
  }))
}
