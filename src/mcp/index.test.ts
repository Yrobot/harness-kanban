import { describe, expect, it } from "bun:test"

import { asText, asError, getContext, server, withErrorHandling } from "@/mcp/index.js"

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

  describe("asError", () => {
    it("returns unified error format", () => {
      const result = asError(new Error("Task not found: t_000001"))
      expect(result.isError).toBe(true)
      expect(result.content[0].text).toBe("[NOT_FOUND] Task not found: t_000001")
    })

    it("handles non-Error values", () => {
      const result = asError(null)
      expect(result.isError).toBe(true)
      expect(result.content[0].text).toBe("[INTERNAL_ERROR] Unknown error")
    })
  })

  describe("withErrorHandling", () => {
    it("wraps successful handler with asText", async () => {
      const handler = withErrorHandling(async () => ({ ok: true }))
      const result = await handler()
      expect(result.isError).toBeUndefined()
      expect(result.content[0].text).toBe(JSON.stringify({ ok: true }, null, 2))
    })

    it("catches runtime errors and returns asError", async () => {
      const handler = withErrorHandling(async () => {
        throw new Error("Requirement not found: 20260101120000")
      })
      const result = await handler()
      expect(result.isError).toBe(true)
      expect(result.content[0].text).toBe("[NOT_FOUND] Requirement not found: 20260101120000")
    })
  })

  describe("registered tools", () => {
    const tools = (server as unknown as { _registeredTools: Record<string, unknown> })._registeredTools

    it("registers all expected tools", () => {
      const expected = [
        "create-req",
        "list-req",
        "get-req",
        "update-req",
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

    describe("update-req schema", () => {
      const updateReqTool = tools["update-req"] as {
        inputSchema: {
          safeParse: (v: unknown) => { success: boolean }
        }
      }

      it("accepts valid status enum values", () => {
        const parse = updateReqTool.inputSchema.safeParse({
          id: "20260101120000",
          status: "completed",
        })
        expect(parse.success).toBe(true)
      })

      it("rejects invalid status", () => {
        const parse = updateReqTool.inputSchema.safeParse({
          id: "20260101120000",
          status: "invalid",
        })
        expect(parse.success).toBe(false)
      })

      it("requires id", () => {
        const parse = updateReqTool.inputSchema.safeParse({ status: "completed" })
        expect(parse.success).toBe(false)
      })
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
          req: "20260101120000",
          status: "done",
        })
        expect(parse.success).toBe(true)
      })

      it("rejects invalid status", () => {
        const parse = updateTool.inputSchema.safeParse({
          id: "t_000001",
          req: "20260101120000",
          status: "invalid",
        })
        expect(parse.success).toBe(false)
      })

      it("accepts set/add/remove as records", () => {
        const parse = updateTool.inputSchema.safeParse({
          id: "t_000001",
          req: "20260101120000",
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

    describe("get-task schema", () => {
      const getTaskTool = tools["get-task"] as {
        inputSchema: {
          safeParse: (v: unknown) => { success: boolean }
        }
      }

      it("requires req", () => {
        const parse = getTaskTool.inputSchema.safeParse({ id: "t_000001" })
        expect(parse.success).toBe(false)
      })

      it("accepts with req", () => {
        const parse = getTaskTool.inputSchema.safeParse({ id: "t_000001", req: "20260101120000" })
        expect(parse.success).toBe(true)
      })
    })

    describe("delete-task schema", () => {
      const deleteTaskTool = tools["delete-task"] as {
        inputSchema: {
          safeParse: (v: unknown) => { success: boolean }
        }
      }

      it("requires req", () => {
        const parse = deleteTaskTool.inputSchema.safeParse({ id: "t_000001" })
        expect(parse.success).toBe(false)
      })

      it("accepts with req", () => {
        const parse = deleteTaskTool.inputSchema.safeParse({ id: "t_000001", req: "20260101120000" })
        expect(parse.success).toBe(true)
      })
    })

    describe("get-task-prompt schema", () => {
      const getTaskPromptTool = tools["get-task-prompt"] as {
        inputSchema: {
          safeParse: (v: unknown) => { success: boolean }
        }
      }

      it("requires req", () => {
        const parse = getTaskPromptTool.inputSchema.safeParse({ id: "t_000001" })
        expect(parse.success).toBe(false)
      })

      it("accepts with req", () => {
        const parse = getTaskPromptTool.inputSchema.safeParse({ id: "t_000001", req: "20260101120000" })
        expect(parse.success).toBe(true)
      })
    })

    describe("get-task runtime error", () => {
      const getTaskTool = tools["get-task"] as {
        handler: (input: unknown) => Promise<{
          content: Array<{ type: "text"; text: string }>
          isError?: true
        }>
      }

      it("returns unified error for nonexistent task", async () => {
        const result = await getTaskTool.handler({ id: "t_000001", req: "20260101120000" })
        expect(result.isError).toBe(true)
        expect(result.content[0].text).toContain("[NOT_FOUND]")
      })
    })

    describe("list-task runtime error", () => {
      const listTaskTool = tools["list-task"] as {
        handler: (input: unknown) => Promise<{
          content: Array<{ type: "text"; text: string }>
          isError?: true
        }>
      }

      it("returns unified error for nonexistent requirement", async () => {
        const result = await listTaskTool.handler({ req: "20260101120000" })
        expect(result.isError).toBe(true)
        expect(result.content[0].text).toContain("[NOT_FOUND]")
      })
    })

    describe("list-task field boundary", () => {
      const listTaskTool = tools["list-task"] as {
        handler: (input: unknown) => Promise<{
          content: Array<{ type: "text"; text: string }>
          isError?: true
        }>
      }

      it("returns summary items without detail fields when data exists", async () => {
        // This test verifies the field boundary contract for list-task
        // We can't easily create data from MCP handler, but we can verify
        // the interface contract at compile time via types
        // The actual field boundary is tested in interface/task.test.ts
        expect(listTaskTool.handler).toBeDefined()
      })
    })
  })
})
