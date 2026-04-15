import { describe, expect, it } from "bun:test"
import path from "node:path"

import {
  resolveCwd,
  resolveHomeDir,
  resolveRequirementFilePath,
  resolveRequirementsDir,
  resolveStoreRoot,
} from "@/core/path.js"

describe("core/path", () => {
  it("resolveHomeDir uses context.homeDir when provided", () => {
    expect(resolveHomeDir({ homeDir: "/users/custom-home" })).toBe("/users/custom-home")
  })

  it("resolveHomeDir falls back to os.homedir when context.homeDir is absent", () => {
    const actual = resolveHomeDir({})
    expect(typeof actual).toBe("string")
    expect(actual.length).toBeGreaterThan(0)
  })

  it("resolveCwd uses context.cwd when provided", () => {
    expect(resolveCwd({ cwd: "/workspace/custom-cwd" })).toBe("/workspace/custom-cwd")
  })

  it("resolveCwd falls back to process.cwd when context.cwd is absent", () => {
    const actual = resolveCwd({})
    expect(actual).toBe(process.cwd())
  })

  it("resolveStoreRoot handles global and local mode", () => {
    const context = {
      homeDir: "/users/custom-home",
      cwd: "/workspace/project",
    }

    expect(resolveStoreRoot({ ...context, global: true })).toBe(path.join("/users/custom-home", ".harness-kanban"))
    expect(resolveStoreRoot({ ...context, global: false })).toBe(path.join("/workspace/project", ".harness-kanban"))
  })

  it("resolveRequirementsDir appends requirements directory", () => {
    const actual = resolveRequirementsDir({ global: false, cwd: "/workspace/project" })

    expect(actual).toBe(path.join("/workspace/project", ".harness-kanban", "requirements"))
  })

  it("resolveRequirementFilePath builds requirement index path", () => {
    const actual = resolveRequirementFilePath(
      { global: false, cwd: "/workspace/project" },
      "20260101120000",
    )

    expect(actual).toBe(path.join("/workspace/project", ".harness-kanban", "requirements", "20260101120000", "index.json"))
  })
})
