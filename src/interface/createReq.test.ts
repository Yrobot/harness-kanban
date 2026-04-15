import { beforeEach, describe, expect, it } from "bun:test"
import fs from "node:fs/promises"
import path from "node:path"

import { createReq } from "@/interface/createReq.js"
import { getReq } from "@/interface/getReq.js"
import { listReq } from "@/interface/listReq.js"
import { deleteReq } from "@/interface/deleteReq.js"

function getTempCwd(): string {
  return path.join(process.cwd(), ".tmp-tests", `create-req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)
}

describe("interface/createReq", () => {
  let cwd: string

  beforeEach(async () => {
    cwd = getTempCwd()
    await fs.mkdir(cwd, { recursive: true })
  })

  it("creates, gets, lists and deletes requirement", async () => {
    const created = await createReq(
      "用户中心",
      { id: "20260101120000", description: "处理登录注册" },
      { cwd },
    )

    expect(created.id).toBe("20260101120000")
    expect(created.status).toBe("planning")
    expect(created.tasks).toEqual([])

    const got = await getReq("20260101120000", { cwd })
    expect(got.title).toBe("用户中心")

    const listed = await listReq({}, { cwd })
    expect(listed).toHaveLength(1)

    const deleted = await deleteReq("20260101120000", { cwd })
    expect(deleted).toEqual({ id: "20260101120000", deleted: true })
  })

  it("throws for invalid req id", async () => {
    await expect(createReq("x", { id: "bad" }, { cwd })).rejects.toThrow(
      "Invalid requirement id. Expected format YYYYMMDDHHmmss",
    )
  })
})
