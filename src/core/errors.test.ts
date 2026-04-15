import { describe, expect, it } from "bun:test"

import { formatError, normalizeError } from "@/core/errors.js"

describe("core/errors", () => {
  describe("normalizeError", () => {
    describe("Error instances", () => {
      it("extracts message and maps not found", () => {
        const err = new Error("Requirement not found: 20260101120000")
        const result = normalizeError(err)
        expect(result.code).toBe("NOT_FOUND")
        expect(result.message).toBe("Requirement not found: 20260101120000")
      })

      it("maps task not found", () => {
        const err = new Error("Task not found: t_000001")
        const result = normalizeError(err)
        expect(result.code).toBe("NOT_FOUND")
        expect(result.message).toBe("Task not found: t_000001")
      })

      it("maps already exists", () => {
        const err = new Error("Task already exists: t_000001")
        const result = normalizeError(err)
        expect(result.code).toBe("ALREADY_EXISTS")
        expect(result.message).toBe("Task already exists: t_000001")
      })

      it("maps invalid id", () => {
        const err = new Error("Invalid requirement id. Expected format YYYYMMDDHHmmss")
        const result = normalizeError(err)
        expect(result.code).toBe("INVALID_INPUT")
        expect(result.message).toBe("Invalid requirement id. Expected format YYYYMMDDHHmmss")
      })

      it("maps missing required argument", () => {
        const err = new Error("Missing required argument: req")
        const result = normalizeError(err)
        expect(result.code).toBe("INVALID_INPUT")
        expect(result.message).toBe("Missing required argument: req")
      })

      it("maps JSON parse errors", () => {
        const err = new Error("Unexpected token 'x', \"xyz\" is not valid JSON")
        const result = normalizeError(err)
        expect(result.code).toBe("INVALID_JSON")
      })

      it("falls back to INTERNAL_ERROR for unclassified messages", () => {
        const err = new Error("something weird happened")
        const result = normalizeError(err)
        expect(result.code).toBe("INTERNAL_ERROR")
        expect(result.message).toBe("something weird happened")
      })

      it("handles empty Error message", () => {
        const err = new Error("")
        const result = normalizeError(err)
        expect(result.message).toBe("Unknown error")
      })
    })

    describe("non-Error fallbacks", () => {
      it("handles string throws", () => {
        const result = normalizeError("string error message")
        expect(result.code).toBe("INTERNAL_ERROR")
        expect(result.message).toBe("string error message")
      })

      it("handles null throws", () => {
        const result = normalizeError(null)
        expect(result.code).toBe("INTERNAL_ERROR")
        expect(result.message).toBe("Unknown error")
      })

      it("handles undefined throws", () => {
        const result = normalizeError(undefined)
        expect(result.code).toBe("INTERNAL_ERROR")
        expect(result.message).toBe("Unknown error")
      })

      it("handles object throws", () => {
        const result = normalizeError({ reason: "timeout" })
        expect(result.message).toBe(JSON.stringify({ reason: "timeout" }))
      })

      it("handles empty string throws", () => {
        const result = normalizeError("")
        expect(result.message).toBe("Unknown error")
      })
    })
  })

  describe("formatError", () => {
    it("formats with CODE prefix", () => {
      const err = new Error("Requirement not found: abc")
      const result = formatError(err)
      expect(result).toBe("[NOT_FOUND] Requirement not found: abc")
    })

    it("formats non-Error values", () => {
      const result = formatError("raw error")
      expect(result).toBe("[INTERNAL_ERROR] raw error")
    })

    it("formats null as Unknown error", () => {
      const result = formatError(null)
      expect(result).toBe("[INTERNAL_ERROR] Unknown error")
    })
  })
})
