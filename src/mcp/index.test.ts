import { describe, expect, it } from "bun:test"

import { asText, getContext, server } from "@/mcp/index.js"

describe("mcp/index", () => {
  describe("getContext", () => {
    it("defaults global to false", () => {
      expect(getContext()).toEqual({ global: false })
      expect(getContext(undefined)).toEqual({ global: false })
    })

    it("respects explicit global", () => {
      expect(getContext(true)).toEqual({ global: true })
      expect(getContext(false)).toEqual({ global: false })
    })
  })

  describe("asText", () => {
    it("wraps payload in text content", () => {
      const result = asText({ hello: "world" })
      expect(result).toEqual({
        content: [{ type: "text", text: JSON.stringify({ hello: "world" }, null, 2) }],
      })
    })

    it("handles string payloads", () => {
      const result = asText("plain text")
      expect(result.content[0].text).toBe(JSON.stringify("plain text", null, 2))
    })
  })

  describe("registered tools", () => {
    const tools = (server as unknown as { _registeredTools: Record<string, unknown> })._registeredTools

    it("registers all expected tools", () => {
      const expected = [
        "create-req",
        "list-req",
        "get-req",
        "delete-req",
        "create-task",
        "list-task",
        "get-task",
        "update-task",
        "delete-task",
        "get-task-prompt",
      ]

      expect(Object.keys(tools)).toEqual(expected)
    })

    describe("update-task schema", () => {
      const updateTool = tools["update-task"] as {
        inputSchema: {
          safeParse: (v: unknown) => { success: boolean; error?: { issues: Array<{ message: string }> } }
        }
      }

      it("accepts valid status enum values", () => {
        const parse = updateTool.inputSchema.safeParse({
          id: "t_000001",
          status: "done",
        })
        expect(parse.success).toBe(true)
      })

      it("rejects invalid status", () => {
        const parse = updateTool.inputSchema.safeParse({
          id: "t_000001",
          status: "invalid",
        })
        expect(parse.success).toBe(false)
      })

      it("accepts set/add/remove as records", () => {
        const parse = updateTool.inputSchema.safeParse({
          id: "t_000001",
          set: { title: "new" },
          add: { constraints: ["c1"] },
          remove: { context_mapping: ["src/a"] },
        })
        expect(parse.success).toBe(true)
      })

      it("rejects add with non-string values", () => {
        const parse = updateTool.inputSchema.safeParse({
          id: "t_000001",
          add: { constraints: [123] },
        })
        expect(parse.success).toBe(false)
      })

      it("requires id", () => {
        const parse = updateTool.inputSchema.safeParse({ status: "done" })
        expect(parse.success).toBe(false)
      })
    })
  })
})
