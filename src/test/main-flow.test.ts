import { beforeEach, describe, expect, it } from "bun:test"
import fs from "node:fs/promises"
import path from "node:path"

const cliEntry = path.join(process.cwd(), "src", "bin", "index.ts")

function getTempCwd(): string {
  return path.join(process.cwd(), ".tmp-tests", `main-flow-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)
}

async function runCli(cwd: string, args: string[]): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const proc = Bun.spawn(["bun", "run", cliEntry, ...args], {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
  })

  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ])

  return { stdout, stderr, exitCode }
}

describe("main flow", () => {
  let cwd: string

  beforeEach(async () => {
    cwd = getTempCwd()
    await fs.mkdir(cwd, { recursive: true })
  })

  it("completes requirement and task lifecycle through CLI", async () => {
    const reqId = "20260101120000"
    const logStep = (step: string, expected: string): void => {
      console.log(`[${step}]:{${expected}}`)
    }

    logStep("创建需求", "创建需求成功，返回 planning 状态且 tasks 为空")
    const createReqResult = await runCli(cwd, [
      "create-req",
      "用户中心",
      "--id",
      reqId,
      "--description",
      "处理登录注册",
    ])
    expect(createReqResult.exitCode).toBe(0)

    const createdReq = JSON.parse(createReqResult.stdout) as {
      id: string
      status: string
      tasks: unknown[]
    }
    expect(createdReq.id).toBe(reqId)
    expect(createdReq.status).toBe("planning")
    expect(createdReq.tasks).toEqual([])

    logStep("创建任务1", "创建第一个任务成功，状态为 todo 且无依赖")
    const createTask1Result = await runCli(cwd, [
      "create-task",
      "--req",
      reqId,
      "--id",
      "t_000001",
      "--title",
      "实现 API",
      "--context",
      "src/interface/*",
      "--tests",
      "bun test",
    ])
    expect(createTask1Result.exitCode).toBe(0)

    const task1 = JSON.parse(createTask1Result.stdout) as {
      id: string
      status: string
      dependencies: string[]
    }
    expect(task1.id).toBe("t_000001")
    expect(task1.status).toBe("todo")
    expect(task1.dependencies).toEqual([])

    logStep("创建任务2", "创建第二个任务成功，并正确依赖 t_000001")
    const createTask2Result = await runCli(cwd, [
      "create-task",
      "--req",
      reqId,
      "--id",
      "t_000002",
      "--title",
      "对接页面",
      "--dependencies",
      "t_000001",
      "--constraints",
      "保持接口稳定",
    ])
    expect(createTask2Result.exitCode).toBe(0)

    const task2 = JSON.parse(createTask2Result.stdout) as {
      id: string
      status: string
      dependencies: string[]
    }
    expect(task2.id).toBe("t_000002")
    expect(task2.status).toBe("todo")
    expect(task2.dependencies).toEqual(["t_000001"])

    logStep("查询任务列表", "列出任务成功，按顺序返回两个任务")
    const listTaskResult = await runCli(cwd, ["list-task", "--req", reqId])
    expect(listTaskResult.exitCode).toBe(0)

    const listedTasks = JSON.parse(listTaskResult.stdout) as Array<{ id: string }>
    expect(listedTasks).toHaveLength(2)
    expect(listedTasks.map((item) => item.id)).toEqual(["t_000001", "t_000002"])

    logStep("获取任务详情", "获取 t_000001 详情成功，标题匹配")
    const getTaskResult = await runCli(cwd, ["get-task", "t_000001", "--req", reqId])
    expect(getTaskResult.exitCode).toBe(0)

    const gotTask = JSON.parse(getTaskResult.stdout) as { id: string; title: string }
    expect(gotTask.id).toBe("t_000001")
    expect(gotTask.title).toBe("实现 API")

    logStep("更新任务状态为进行中", "将 t_000001 更新为 in_progress 成功")
    const task1InProgressResult = await runCli(cwd, ["update-task", "t_000001", "--status", "in_progress", "--req", reqId])
    expect(task1InProgressResult.exitCode).toBe(0)

    logStep("完成任务并写入摘要", "将 t_000001 更新为 done 并写入 result_summary")
    const task1DoneResult = await runCli(cwd, [
      "update-task",
      "t_000001",
      "--status",
      "done",
      "--summary",
      "接口开发完成，返回字段已对齐",
      "--req",
      reqId,
    ])
    expect(task1DoneResult.exitCode).toBe(0)

    const task1Done = JSON.parse(task1DoneResult.stdout) as { status: string; result_summary?: string }
    expect(task1Done.status).toBe("done")
    expect(task1Done.result_summary).toBe("接口开发完成，返回字段已对齐")

    logStep("生成任务提示词", "生成 t_000002 的 prompt 成功，并包含依赖任务产出")
    const promptResult = await runCli(cwd, ["get-task-prompt", "t_000002", "--req", reqId])
    expect(promptResult.exitCode).toBe(0)
    expect(promptResult.stdout).toContain("## 当前任务")
    expect(promptResult.stdout).toContain("## 依赖任务产出")
    expect(promptResult.stdout).toContain("接口开发完成，返回字段已对齐")

    logStep("推进第二个任务", "将 t_000002 更新为 in_progress 成功")
    const task2InProgressResult = await runCli(cwd, ["update-task", "t_000002", "--status", "in_progress", "--req", reqId])
    expect(task2InProgressResult.exitCode).toBe(0)

    const task2InProgress = JSON.parse(task2InProgressResult.stdout) as { status: string }
    expect(task2InProgress.status).toBe("in_progress")

    logStep("完成需求", "将需求状态更新为 completed 成功")
    const updateReqResult = await runCli(cwd, ["update-req", reqId, "--status", "completed"])
    expect(updateReqResult.exitCode).toBe(0)

    const updatedReq = JSON.parse(updateReqResult.stdout) as { status: string }
    expect(updatedReq.status).toBe("completed")

    logStep("获取需求详情", "获取需求详情成功，状态为 completed")
    const getReqResult = await runCli(cwd, ["get-req", reqId])
    expect(getReqResult.exitCode).toBe(0)

    const gotReq = JSON.parse(getReqResult.stdout) as { status: string }
    expect(gotReq.status).toBe("completed")

    logStep("按状态筛选需求", "按 completed 过滤需求列表成功，返回当前需求")
    const listReqCompletedResult = await runCli(cwd, ["list-req", "--status", "completed"])
    expect(listReqCompletedResult.exitCode).toBe(0)

    const completedReqs = JSON.parse(listReqCompletedResult.stdout) as Array<{
      id: string
      status: string
    }>
    expect(completedReqs).toHaveLength(1)
    expect(completedReqs[0].id).toBe(reqId)
    expect(completedReqs[0].status).toBe("completed")

    logStep("删除任务", "删除 t_000002 成功，并返回 deleted=true")
    const deleteTaskResult = await runCli(cwd, ["delete-task", "t_000002", "--req", reqId])
    expect(deleteTaskResult.exitCode).toBe(0)

    const deletedTask = JSON.parse(deleteTaskResult.stdout) as { id: string; deleted: boolean }
    expect(deletedTask.id).toBe("t_000002")
    expect(deletedTask.deleted).toBe(true)
  })
})
