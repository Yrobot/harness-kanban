import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"

import {
  createReq,
  createTask,
  deleteReq,
  deleteTask,
  getReq,
  getTask,
  getTaskPrompt,
  listReq,
  listTask,
  updateReq,
  updateTask,
} from "@/interface/index.js"
import { formatError } from "@/core/errors.js"
import type {
  CommandContext,
  UpdateTaskAddPayload,
  UpdateTaskRemovePayload,
  UpdateTaskSetPayload,
} from "@/core/types.js"

export function getContext(global?: boolean): CommandContext {
  return {
    global: global ?? false,
  }
}

export function asText(payload: unknown): { content: Array<{ type: "text"; text: string }> } {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(payload, null, 2),
      },
    ],
  }
}

type McpResult = {
  content: Array<{ type: "text"; text: string }>
  isError?: true
}

export function asError(error: unknown): McpResult {
  return {
    content: [
      {
        type: "text",
        text: formatError(error),
      },
    ],
    isError: true,
  }
}

export function withErrorHandling<T extends readonly unknown[], R>(
  handler: (...args: T) => Promise<R>,
): (...args: T) => Promise<McpResult> {
  return async (...args: T): Promise<McpResult> => {
    try {
      const result = await handler(...args)
      return asText(result)
    } catch (error) {
      return asError(error)
    }
  }
}

export const server = new McpServer({
  name: "@yrobot/harness-kanban",
  version: "0.1.0",
})

server.tool(
  "create-req",
  {
    title: z.string(),
    id: z.string().optional(),
    description: z.string().optional(),
    global: z.boolean().optional(),
  },
  withErrorHandling(
    async (input) => await createReq(input.title, { id: input.id, description: input.description }, getContext(input.global)),
  ),
)

server.tool(
  "list-req",
  {
    status: z.string().optional(),
    global: z.boolean().optional(),
  },
  withErrorHandling(
    async (input) => await listReq({ status: input.status }, getContext(input.global)),
  ),
)

server.tool(
  "get-req",
  {
    id: z.string(),
    global: z.boolean().optional(),
  },
  withErrorHandling(
    async (input) => await getReq(input.id, getContext(input.global)),
  ),
)

server.tool(
  "update-req",
  {
    id: z.string(),
    status: z.enum(["planning", "developing", "completed"]).optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    global: z.boolean().optional(),
  },
  withErrorHandling(
    async (input) => await updateReq(
      input.id,
      {
        status: input.status,
        title: input.title,
        description: input.description,
      },
      getContext(input.global),
    ),
  ),
)

server.tool(
  "delete-req",
  {
    id: z.string(),
    global: z.boolean().optional(),
  },
  withErrorHandling(
    async (input) => await deleteReq(input.id, getContext(input.global)),
  ),
)

server.tool(
  "create-task",
  {
    id: z.string().optional(),
    req: z.string(),
    title: z.string(),
    context: z.array(z.string()).optional(),
    tests: z.array(z.string()).optional(),
    constraints: z.array(z.string()).optional(),
    dependencies: z.array(z.string()).optional(),
    background: z.string().optional(),
    global: z.boolean().optional(),
  },
  withErrorHandling(
    async (input) => await createTask(
      {
        id: input.id,
        req: input.req,
        title: input.title,
        context: input.context,
        tests: input.tests,
        constraints: input.constraints,
        dependencies: input.dependencies,
        background: input.background,
      },
      getContext(input.global),
    ),
  ),
)

server.tool(
  "list-task",
  {
    req: z.string(),
    status: z.string().optional(),
    global: z.boolean().optional(),
  },
  withErrorHandling(
    async (input) => await listTask({ req: input.req, status: input.status }, getContext(input.global)),
  ),
)

server.tool(
  "get-task",
  {
    id: z.string(),
    req: z.string(),
    global: z.boolean().optional(),
  },
  withErrorHandling(
    async (input) => await getTask(input.id, input.req, getContext(input.global)),
  ),
)

server.tool(
  "update-task",
  {
    id: z.string(),
    req: z.string(),
    status: z.enum(["todo", "in_progress", "done", "blocked"]).optional(),
    summary: z.string().optional(),
    set: z.record(z.unknown()).optional(),
    add: z.record(z.array(z.string())).optional(),
    remove: z.record(z.array(z.string())).optional(),
    global: z.boolean().optional(),
  },
  withErrorHandling(
    async (input) => {
      const setPayload = input.set as UpdateTaskSetPayload | undefined
      const addPayload = input.add as UpdateTaskAddPayload | undefined
      const removePayload = input.remove as UpdateTaskRemovePayload | undefined

      return await updateTask(
        input.id,
        input.req,
        {
          status: input.status,
          summary: input.summary,
          set: setPayload,
          add: addPayload,
          remove: removePayload,
        },
        getContext(input.global),
      )
    },
  ),
)

server.tool(
  "delete-task",
  {
    id: z.string(),
    req: z.string(),
    global: z.boolean().optional(),
  },
  withErrorHandling(
    async (input) => await deleteTask(input.id, input.req, getContext(input.global)),
  ),
)

server.tool(
  "get-task-prompt",
  {
    id: z.string(),
    req: z.string(),
    global: z.boolean().optional(),
  },
  withErrorHandling(
    async (input) => await getTaskPrompt(input.id, input.req, getContext(input.global)),
  ),
)

export async function startServer(): Promise<void> {
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

if (import.meta.main) {
  startServer().catch((error) => {
    process.stderr.write(`${formatError(error)}\n`)
    process.exit(1)
  })
}
