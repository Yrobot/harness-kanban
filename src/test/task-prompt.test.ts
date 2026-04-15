import { beforeEach, describe, expect, it } from "bun:test"
import fs from "node:fs/promises"
import path from "node:path"

import { createReq } from "@/interface/createReq.js"
import { createTask } from "@/interface/createTask.js"
import { getTaskPrompt } from "@/interface/getTaskPrompt.js"
import { updateTask } from "@/interface/updateTask.js"

function getTempCwd(): string {
  return path.join(process.cwd(), ".tmp-tests", `task-prompt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)
}

function sectionBounds(prompt: string, section: string): [number, number] {
  const start = prompt.indexOf(`## ${section}`)
  if (start === -1) {
    return [-1, -1]
  }
  const nextHeader = prompt.indexOf("\n## ", start + 1)
  return [start, nextHeader === -1 ? prompt.length : nextHeader]
}

describe("task-prompt integration", () => {
  let cwd: string

  beforeEach(async () => {
    cwd = getTempCwd()
    await fs.mkdir(cwd, { recursive: true })
    await createReq("用户中心", { id: "20260101120000", description: "处理登录注册" }, { cwd })
  })

  describe("prompt structure", () => {
    it("contains all 8 sections in correct order", async () => {
      const task = await createTask({ req: "20260101120000", title: "API 开发" }, { cwd })
      const prompt = await getTaskPrompt(task.id, "20260101120000", { cwd })

      const sections = [
        "需求背景",
        "当前任务",
        "上下文映射",
        "约束条件",
        "输出要求",
        "执行步骤",
        "依赖任务产出",
        "验证清单",
      ]

      let lastIndex = -1
      for (const section of sections) {
        const idx = prompt.indexOf(`## ${section}`)
        expect(idx).toBeGreaterThan(lastIndex)
        lastIndex = idx
      }
    })
  })

  describe("data field placement", () => {
    it("places requirement description under 需求背景", async () => {
      const task = await createTask({ req: "20260101120000", title: "A" }, { cwd })
      const prompt = await getTaskPrompt(task.id, "20260101120000", { cwd })
      const [start, end] = sectionBounds(prompt, "需求背景")
      const content = prompt.slice(start, end)
      expect(content).toContain("处理登录注册")
    })

    it("places task id and title under 当前任务", async () => {
      const task = await createTask({ req: "20260101120000", title: "对接页面" }, { cwd })
      const prompt = await getTaskPrompt(task.id, "20260101120000", { cwd })
      const [start, end] = sectionBounds(prompt, "当前任务")
      const content = prompt.slice(start, end)
      expect(content).toContain(task.id)
      expect(content).toContain("对接页面")
    })

    it("places constraints under 约束条件", async () => {
      const task = await createTask(
        { req: "20260101120000", title: "A", constraints: ["禁止修改接口", "保持向后兼容"] },
        { cwd },
      )
      const prompt = await getTaskPrompt(task.id, "20260101120000", { cwd })
      const [start, end] = sectionBounds(prompt, "约束条件")
      const content = prompt.slice(start, end)
      expect(content).toContain("禁止修改接口")
      expect(content).toContain("保持向后兼容")
    })

    it("places verification_steps under 验证清单", async () => {
      const task = await createTask(
        { req: "20260101120000", title: "A", tests: ["bun test", "pnpm run ts-check"] },
        { cwd },
      )
      const prompt = await getTaskPrompt(task.id, "20260101120000", { cwd })
      const [start, end] = sectionBounds(prompt, "验证清单")
      const content = prompt.slice(start, end)
      expect(content).toContain("bun test")
      expect(content).toContain("pnpm run ts-check")
    })

    it("places background_chunk under 执行步骤", async () => {
      const task = await createTask(
        { req: "20260101120000", title: "A", background: "先实现接口再写测试" },
        { cwd },
      )
      const prompt = await getTaskPrompt(task.id, "20260101120000", { cwd })
      const [start, end] = sectionBounds(prompt, "执行步骤")
      const content = prompt.slice(start, end)
      expect(content).toContain("先实现接口再写测试")
    })
  })

  describe("dependency resolution", () => {
    it("injects result_summary for dependency with summary", async () => {
      const dep = await createTask({ req: "20260101120000", title: "前置" }, { cwd })
      await updateTask(dep.id, "20260101120000", { summary: "前置任务已完成" }, { cwd })

      const task = await createTask({ req: "20260101120000", title: "后置", dependencies: [dep.id] }, { cwd })
      const prompt = await getTaskPrompt(task.id, "20260101120000", { cwd })

      const [start, end] = sectionBounds(prompt, "依赖任务产出")
      const content = prompt.slice(start, end)
      expect(content).toContain("前置任务已完成")
    })

    it("shows fallback for dependency without summary", async () => {
      const dep = await createTask({ req: "20260101120000", title: "前置" }, { cwd })
      const task = await createTask({ req: "20260101120000", title: "后置", dependencies: [dep.id] }, { cwd })
      const prompt = await getTaskPrompt(task.id, "20260101120000", { cwd })

      const [start, end] = sectionBounds(prompt, "依赖任务产出")
      const content = prompt.slice(start, end)
      expect(content).toContain(`依赖任务 ${dep.id} 暂无 result_summary`)
    })

    it("handles non-existent dependency", async () => {
      const task = await createTask(
        { req: "20260101120000", title: "A", dependencies: ["t_nonexistent"] },
        { cwd },
      )
      const prompt = await getTaskPrompt(task.id, "20260101120000", { cwd })

      const [start, end] = sectionBounds(prompt, "依赖任务产出")
      const content = prompt.slice(start, end)
      expect(content).toContain("依赖任务 t_nonexistent 不存在")
    })

    it("numbers multiple dependencies", async () => {
      const d1 = await createTask({ req: "20260101120000", title: "A" }, { cwd })
      const d2 = await createTask({ req: "20260101120000", title: "B" }, { cwd })
      await updateTask(d1.id, "20260101120000", { summary: "A done" }, { cwd })
      await updateTask(d2.id, "20260101120000", { summary: "B done" }, { cwd })

      const task = await createTask(
        { req: "20260101120000", title: "C", dependencies: [d1.id, d2.id] },
        { cwd },
      )
      const prompt = await getTaskPrompt(task.id, "20260101120000", { cwd })

      const [start, end] = sectionBounds(prompt, "依赖任务产出")
      const content = prompt.slice(start, end)
      expect(content).toContain("### 依赖任务 1")
      expect(content).toContain("### 依赖任务 2")
      expect(content).toContain("A done")
      expect(content).toContain("B done")
    })

    it("shows 无 for task with no dependencies", async () => {
      const task = await createTask({ req: "20260101120000", title: "独立任务" }, { cwd })
      const prompt = await getTaskPrompt(task.id, "20260101120000", { cwd })

      const contentAfterHeader = prompt.split("## 依赖任务产出\n")[1] ?? ""
      expect(contentAfterHeader.trim().startsWith("无")).toBe(true)
    })
  })

  describe("cross-req isolation", () => {
    it("produces different prompts for same taskId under different reqs", async () => {
      const req1 = "20260101120000"
      const req2 = "20260101130000"

      await createReq("需求B", { id: req2, description: "另一个需求" }, { cwd })
      await createTask({ req: req1, id: "t_000001", title: "任务A" }, { cwd })
      await createTask({ req: req2, id: "t_000001", title: "任务B" }, { cwd })

      const prompt1 = await getTaskPrompt("t_000001", req1, { cwd })
      const prompt2 = await getTaskPrompt("t_000001", req2, { cwd })

      expect(prompt1).toContain("任务A")
      expect(prompt2).toContain("任务B")
      expect(prompt1).not.toContain("任务B")
      expect(prompt2).not.toContain("任务A")
    })

    it("throws when taskId not found under given req", async () => {
      const otherTask = await createTask({ req: "20260101120000", id: "t_000001", title: "A" }, { cwd })

      await expect(
        getTaskPrompt(otherTask.id, "20260201120000", { cwd }),
      ).rejects.toThrow()
    })
  })
})
