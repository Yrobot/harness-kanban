import { readRequirement } from "@/core/storage.js"
import { assertReqId } from "@/core/validators.js"
import type { CommandContext, Requirement } from "@/core/types.js"

export async function getReq(reqId: string, context: CommandContext = {}): Promise<Requirement> {
  assertReqId(reqId)

  try {
    return await readRequirement(context, reqId)
  } catch {
    throw new Error(`Requirement not found: ${reqId}`)
  }
}
