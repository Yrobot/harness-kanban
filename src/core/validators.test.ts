import { describe, expect, it } from "bun:test"

import {
  assertNonEmpty,
  assertReqId,
  assertRequirementStatus,
  assertTaskId,
  assertTaskStatus,
} from "@/core/validators.js"

describe("core/validators", () => {
  it.each([
    { input: "20260101120000", valid: true },
    { input: "2026010112000", valid: false },
    { input: "2026-01-01-120000", valid: false },
  ])("assertReqId handles $input", ({ input, valid }) => {
    if (valid) {
      expect(() => assertReqId(input)).not.toThrow()
      return
    }

    expect(() => assertReqId(input)).toThrow("Invalid requirement id. Expected format YYYYMMDDHHmmss")
  })

  it.each([
    { input: "t_000001", valid: true },
    { input: "x_000001", valid: false },
    { input: "t_00001", valid: false },
  ])("assertTaskId handles $input", ({ input, valid }) => {
    if (valid) {
      expect(() => assertTaskId(input)).not.toThrow()
      return
    }

    expect(() => assertTaskId(input)).toThrow("Invalid task id. Expected format t_000000")
  })

  it.each([
    { input: "planning", valid: true },
    { input: "developing", valid: true },
    { input: "completed", valid: true },
    { input: "todo", valid: false },
  ])("assertRequirementStatus handles $input", ({ input, valid }) => {
    if (valid) {
      expect(() => assertRequirementStatus(input)).not.toThrow()
      return
    }

    expect(() => assertRequirementStatus(input)).toThrow("Invalid requirement status")
  })

  it.each([
    { input: "todo", valid: true },
    { input: "in_progress", valid: true },
    { input: "done", valid: true },
    { input: "blocked", valid: true },
    { input: "planning", valid: false },
  ])("assertTaskStatus handles $input", ({ input, valid }) => {
    if (valid) {
      expect(() => assertTaskStatus(input)).not.toThrow()
      return
    }

    expect(() => assertTaskStatus(input)).toThrow("Invalid task status")
  })

  it.each([
    { input: "", shouldThrow: true },
    { input: "   ", shouldThrow: true },
    { input: "有效值", shouldThrow: false },
  ])("assertNonEmpty handles input %#", ({ input, shouldThrow }) => {
    if (shouldThrow) {
      expect(() => assertNonEmpty(input, "Value is required")).toThrow("Value is required")
      return
    }

    expect(() => assertNonEmpty(input, "Value is required")).not.toThrow()
  })
})
