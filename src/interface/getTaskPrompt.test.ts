import { beforeEach, describe, expect, it } from "bun:test"
import fs from "node:fs/promises"
import path from "node:path"

import { createReq } from "@/interface/createReq.js"
import { createTask } from "@/interface/createTask.js"
import { getTaskPrompt } from "@/interface/getTaskPrompt.js"
import { updateTask } from "@/interface/updateTask.js"

function getTempCwd(): string {
  return path.join(process.cwd(), ".tmp-tests", `prompt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)
}

describe("interface/getTaskPrompt", () => {
  let cwd: string

  beforeEach(async () => {
    cwd = getTempCwd()
    await fs.mkdir(cwd, { recursive: true })
    await createReq("用户中心", { id: "20260101120000", description: "处理登录注册" }, { cwd })
  })

  it("injects dependency result_summary", async () => {
    const dependency = await createTask({ req: "20260101120000", title: "先做A" }, { cwd })
    await updateTask(dependency.id, "20260101120000", { summary: "A 已完成" }, { cwd })

    const current = await createTask(
      {
        req: "20260101120000",
        title: "再做B",
        dependencies: [dependency.id],
        constraints: ["禁止修改 API"],
        tests: ["bun test"],
      },
      { cwd },
    )

    const prompt = await getTaskPrompt(current.id, "20260101120000", { cwd })

    expect(prompt).toContain("## 需求背景")
    expect(prompt).toContain("## 当前任务")
    expect(prompt).toContain("## 约束条件")
    expect(prompt).toContain("## 验证清单")
    expect(prompt).toContain("A 已完成")
  })

  it("shows fallback when dependency has no summary", async () => {
    const dependency = await createTask({ req: "20260101120000", title: "先做A" }, { cwd })
    const current = await createTask({ req: "20260101120000", title: "再做B", dependencies: [dependency.id] }, { cwd })

    const prompt = await getTaskPrompt(current.id, "20260101120000", { cwd })

    expect(prompt).toContain(`依赖任务 ${dependency.id} 暂无 result_summary`)
  })
})
