import { deleteRequirementById, requirementExists } from "@/core/storage.js"
import { assertReqId } from "@/core/validators.js"
import type { CommandContext } from "@/core/types.js"

export interface DeleteReqResult {
  id: string
  deleted: boolean
}

export async function deleteReq(reqId: string, context: CommandContext = {}): Promise<DeleteReqResult> {
  assertReqId(reqId)

  if (!(await requirementExists(context, reqId))) {
    throw new Error(`Requirement not found: ${reqId}`)
  }

  await deleteRequirementById(context, reqId)

  return {
    id: reqId,
    deleted: true,
  }
}
