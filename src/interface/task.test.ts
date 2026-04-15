import { beforeEach, describe, expect, it } from "bun:test"
import fs from "node:fs/promises"
import path from "node:path"

import { createReq } from "@/interface/createReq.js"
import { createTask } from "@/interface/createTask.js"
import { listTask } from "@/interface/listTask.js"
import { getTask } from "@/interface/getTask.js"
import { updateTask } from "@/interface/updateTask.js"
import { deleteTask } from "@/interface/deleteTask.js"

function getTempCwd(): string {
  return path.join(process.cwd(), ".tmp-tests", `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)
}

describe("interface/task", () => {
  let cwd: string

  beforeEach(async () => {
    cwd = getTempCwd()
    await fs.mkdir(cwd, { recursive: true })
    await createReq("需求", { id: "20260101120000" }, { cwd })
  })

  it("creates and gets task", async () => {
    const created = await createTask(
      {
        req: "20260101120000",
        title: "API 开发",
        context: ["src/api/*"],
        tests: ["bun test"],
      },
      { cwd },
    )

    expect(created.id).toBe("t_000001")

    const got = await getTask(created.id, "20260101120000", { cwd })
    expect(got.title).toBe("API 开发")
    expect(got.verification_steps).toEqual(["bun test"])
  })

  it("lists by status", async () => {
    const created = await createTask(
      { req: "20260101120000", title: "任务 A" },
      { cwd },
    )

    await updateTask(created.id, "20260101120000", { status: "done" }, { cwd })

    const doneTasks = await listTask({ req: "20260101120000", status: "done" }, { cwd })
    const todoTasks = await listTask({ req: "20260101120000", status: "todo" }, { cwd })

    expect(doneTasks).toHaveLength(1)
    expect(todoTasks).toHaveLength(0)
  })

  it("updates with set/add/remove", async () => {
    const created = await createTask(
      {
        req: "20260101120000",
        title: "任务 A",
        context: ["a"],
        constraints: ["c1"],
      },
      { cwd },
    )

    const updated = await updateTask(
      created.id,
      "20260101120000",
      {
        summary: "完成接口",
        set: { background_chunk: "背景", verification_steps: ["bun test"] },
        add: { context_mapping: ["b"], constraints: ["c2"] },
        remove: { constraints: ["c1"] },
      },
      { cwd },
    )

    expect(updated.result_summary).toBe("完成接口")
    expect(updated.background_chunk).toBe("背景")
    expect(updated.context_mapping).toEqual(["a", "b"])
    expect(updated.constraints).toEqual(["c2"])
    expect(updated.verification_steps).toEqual(["bun test"])
  })

  it("deletes task", async () => {
    const created = await createTask({ req: "20260101120000", title: "任务 A" }, { cwd })

    const deleted = await deleteTask(created.id, "20260101120000", { cwd })
    expect(deleted).toEqual({ id: created.id, req_id: "20260101120000", deleted: true })

    await expect(getTask(created.id, "20260101120000", { cwd })).rejects.toThrow(`Task not found: ${created.id}`)
  })
})
