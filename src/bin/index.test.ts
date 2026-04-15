import { describe, expect, it } from "bun:test"
import path from "node:path"

const cliEntry = path.join(import.meta.dir, "index.ts")

function runCli(args: string[]) {
  return Bun.spawn(["bun", "run", cliEntry, ...args], {
    stdout: "pipe",
    stderr: "pipe",
  })
}

async function runCliAsync(args: string[]) {
  const proc = runCli(args)
  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ])
  const exitCode = await proc.exited
  return { stdout, stderr, exitCode }
}

describe("bin/index", () => {
  it("--help exits 0 and shows help", async () => {
    const { stdout, exitCode } = await runCliAsync(["--help"])
    expect(exitCode).toBe(0)
    expect(stdout).toContain("harness-kanban")
  })

  it("--version exits 0 and shows version", async () => {
    const { stdout, exitCode } = await runCliAsync(["--version"])
    expect(exitCode).toBe(0)
    expect(stdout.length).toBeGreaterThan(0)
  })

  it("create-task with array parameters", async () => {
    const { stdout, stderr, exitCode } = await runCliAsync([
      "create-task",
      "--req",
      "20260101120000",
      "--title",
      "Task A",
      "--context",
      "src/a/*,src/b/*",
      "--tests",
      "bun test",
      "--constraints",
      "c1,c2",
      "--dependencies",
      "t_000000",
    ])

    // Will fail because requirement doesn't exist in local storage,
    // but we can verify the argument parsing doesn't crash
    expect(exitCode).toBe(1)
    expect(stderr).toContain("Requirement not found")
  })

  it("update-task with JSON object parameters", async () => {
    const { stderr, exitCode } = await runCliAsync([
      "update-task",
      "t_000001",
      "--status",
      "done",
      "--summary",
      "完成",
      "--set",
      '{"background_chunk":"bg"}',
      "--add",
      '{"constraints":["c2"]}',
      "--remove",
      '{"constraints":["c1"]}',
    ])

    // Will fail because task doesn't exist, but we verify JSON parsing
    expect(exitCode).toBe(1)
    expect(stderr).toContain("Task not found")
  })

  it("strict() rejects unknown commands", async () => {
    const { exitCode, stderr } = await runCliAsync(["unknown-command"])
    expect(exitCode).toBe(1)
    expect(stderr).toContain("Unknown argument")
  })

  it("create-task missing required args shows error", async () => {
    const { exitCode, stderr } = await runCliAsync(["create-task"])
    expect(exitCode).toBe(1)
    expect(stderr.length).toBeGreaterThan(0)
  })

  it("list-task without --req shows error", async () => {
    const { exitCode, stderr } = await runCliAsync(["list-task"])
    expect(exitCode).toBe(1)
    expect(stderr.length).toBeGreaterThan(0)
  })

  it("no command shows usage", async () => {
    const { exitCode, stderr } = await runCliAsync([])
    expect(exitCode).toBe(1)
    expect(stderr).toContain("Commands:")
  })
})
