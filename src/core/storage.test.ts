import { beforeEach, describe, expect, it } from "bun:test"
import fs from "node:fs/promises"
import path from "node:path"

import {
  deleteRequirementById,
  findTaskInRequirement,
  findTaskWithRequirement,
  listRequirements,
  readRequirement,
  requirementExists,
  saveRequirement,
} from "@/core/storage.js"
import type { Requirement } from "@/core/types.js"

function getTempCwd(): string {
  return path.join(process.cwd(), ".tmp-tests", `storage-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)
}

function buildRequirement(id: string, title: string): Requirement {
  return {
    id,
    title,
    description: "",
    status: "planning",
    tasks: [
      {
        id: "t_000001",
        req_id: id,
        title: "任务",
        context_mapping: [],
        background_chunk: "",
        dependencies: [],
        constraints: [],
        verification_steps: [],
        status: "todo",
      },
    ],
  }
}

describe("core/storage", () => {
  let cwd: string

  beforeEach(async () => {
    cwd = getTempCwd()
    await fs.mkdir(cwd, { recursive: true })
  })

  it("saves and reads requirement", async () => {
    const requirement = buildRequirement("20260101120000", "需求A")
    await saveRequirement({ cwd }, requirement)

    expect(await requirementExists({ cwd }, requirement.id)).toBe(true)

    const read = await readRequirement({ cwd }, requirement.id)
    expect(read).toEqual(requirement)
  })

  it("lists requirements sorted by id", async () => {
    await saveRequirement({ cwd }, buildRequirement("20260101120001", "B"))
    await saveRequirement({ cwd }, buildRequirement("20260101120000", "A"))

    const listed = await listRequirements({ cwd })
    expect(listed.map((item) => item.id)).toEqual(["20260101120000", "20260101120001"])
  })

  it("finds task with requirement", async () => {
    await saveRequirement({ cwd }, buildRequirement("20260101120000", "A"))

    const found = await findTaskWithRequirement({ cwd }, "t_000001")
    expect(found?.requirement.id).toBe("20260101120000")
    expect(found?.task.id).toBe("t_000001")
  })

  it("finds task in a given requirement", async () => {
    const req = buildRequirement("20260101120000", "A")
    await saveRequirement({ cwd }, req)

    const read = await readRequirement({ cwd }, "20260101120000")
    expect(findTaskInRequirement(read, "t_000001")?.id).toBe("t_000001")
    expect(findTaskInRequirement(read, "t_nonexistent")).toBeUndefined()
  })

  it("deletes requirement directory", async () => {
    await saveRequirement({ cwd }, buildRequirement("20260101120000", "A"))

    await deleteRequirementById({ cwd }, "20260101120000")

    expect(await requirementExists({ cwd }, "20260101120000")).toBe(false)
  })
})
