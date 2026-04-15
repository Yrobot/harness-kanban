import os from "node:os"
import path from "node:path"

import type { CommandContext } from "@/core/types.js"

export function resolveHomeDir(context: CommandContext): string {
  return context.homeDir ?? os.homedir()
}

export function resolveCwd(context: CommandContext): string {
  return context.cwd ?? process.cwd()
}

export function resolveStoreRoot(context: CommandContext): string {
  if (context.global) {
    return path.join(resolveHomeDir(context), ".harness-kanban")
  }

  return path.join(resolveCwd(context), ".harness-kanban")
}

export function resolveRequirementsDir(context: CommandContext): string {
  return path.join(resolveStoreRoot(context), "requirements")
}

export function resolveRequirementFilePath(context: CommandContext, reqId: string): string {
  return path.join(resolveRequirementsDir(context), reqId, "index.json")
}
