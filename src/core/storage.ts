import fs from "node:fs/promises"
import path from "node:path"

import { resolveRequirementFilePath, resolveRequirementsDir } from "@/core/path.js"
import type { CommandContext, Requirement, Task } from "@/core/types.js"

async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true })
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  const content = await fs.readFile(filePath, "utf-8")
  return JSON.parse(content) as T
}

async function writeJsonFile(filePath: string, payload: unknown): Promise<void> {
  const dir = path.dirname(filePath)
  await ensureDir(dir)
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2), "utf-8")
}

export async function saveRequirement(context: CommandContext, requirement: Requirement): Promise<Requirement> {
  const filePath = resolveRequirementFilePath(context, requirement.id)
  await writeJsonFile(filePath, requirement)
  return requirement
}

export async function readRequirement(context: CommandContext, reqId: string): Promise<Requirement> {
  const filePath = resolveRequirementFilePath(context, reqId)
  return readJsonFile<Requirement>(filePath)
}

export async function requirementExists(context: CommandContext, reqId: string): Promise<boolean> {
  const filePath = resolveRequirementFilePath(context, reqId)
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

export async function listRequirements(context: CommandContext): Promise<Requirement[]> {
  const requirementsDir = resolveRequirementsDir(context)
  try {
    const entries = await fs.readdir(requirementsDir, { withFileTypes: true })
    const reqIds = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name)
    const requirements = await Promise.all(reqIds.map((reqId) => readRequirement(context, reqId)))

    return requirements.sort((a, b) => a.id.localeCompare(b.id))
  } catch {
    return []
  }
}

export async function deleteRequirementById(context: CommandContext, reqId: string): Promise<void> {
  const requirementDir = path.dirname(resolveRequirementFilePath(context, reqId))
  await fs.rm(requirementDir, { recursive: true, force: true })
}

export async function findTaskWithRequirement(
  context: CommandContext,
  taskId: string,
): Promise<{ requirement: Requirement; task: Task } | undefined> {
  const requirements = await listRequirements(context)

  for (const requirement of requirements) {
    const task = requirement.tasks.find((item) => item.id === taskId)
    if (task) {
      return {
        requirement,
        task,
      }
    }
  }

  return undefined
}
