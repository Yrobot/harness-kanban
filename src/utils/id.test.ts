import { describe, expect, it } from "bun:test"

import { createReqId, createTaskId, formatReqId, isReqId, isTaskId } from "@/utils/id.js"

describe("utils/id", () => {
  it("formats req id from date", () => {
    const date = new Date("2026-01-02T03:04:05")

    expect(formatReqId(date)).toBe("20260102030405")
    expect(createReqId(date)).toBe("20260102030405")
  })

  it.each([
    { value: "20260102030405", expected: true },
    { value: "2026010203040", expected: false },
    { value: "abc", expected: false },
  ])("validates req id: $value", ({ value, expected }) => {
    expect(isReqId(value)).toBe(expected)
  })

  it.each([
    { value: "t_000001", expected: true },
    { value: "t_1", expected: false },
    { value: "task_000001", expected: false },
  ])("validates task id: $value", ({ value, expected }) => {
    expect(isTaskId(value)).toBe(expected)
  })

  it("creates next task id based on existing ids", () => {
    expect(createTaskId([])).toBe("t_000001")
    expect(createTaskId(["t_000001", "t_000003", "invalid"])).toBe("t_000004")
  })
})
