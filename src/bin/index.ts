#!/usr/bin/env node
import yargs, { type Argv, type ArgumentsCamelCase } from "yargs"
import { hideBin } from "yargs/helpers"

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
  updateTask,
} from "@/interface/index.js"
import type {
  CommandContext,
  TaskStatus,
  UpdateTaskAddPayload,
  UpdateTaskRemovePayload,
  UpdateTaskSetPayload,
} from "@/core/types.js"
import {
  parseObject,
  parseStringArray,
} from "@/utils/parse.js"

type AnyArgv = ArgumentsCamelCase<Record<string, unknown>>

function getContext(argv: AnyArgv): CommandContext {
  const globalValue = argv.global
  return {
    global: typeof globalValue === "boolean" ? globalValue : false,
  }
}

function printJson(value: unknown): void {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`)
}

function getOptionalString(argv: AnyArgv, key: string): string | undefined {
  const value = argv[key]
  return typeof value === "string" ? value : undefined
}

function getRequiredString(argv: AnyArgv, key: string): string {
  const value = getOptionalString(argv, key)
  if (!value) {
    throw new Error(`Missing required argument: ${key}`)
  }

  return value
}

function getOptionalStatus(argv: AnyArgv): TaskStatus | undefined {
  const status = getOptionalString(argv, "status")
  if (!status) {
    return undefined
  }

  return status as TaskStatus
}

async function run(): Promise<void> {
  await yargs(hideBin(process.argv))
    .scriptName("harness-kanban")
    .option("global", {
      alias: "g",
      type: "boolean",
      default: false,
      describe: "Use ~/.harness-kanban as storage root",
      global: true,
    })
    .command(
      "create-req <title>",
      "Initialize a requirement",
      (builder: Argv) =>
        builder
          .positional("title", { type: "string", describe: "Requirement title" })
          .option("id", { type: "string", describe: "Requirement id (YYYYMMDDHHmmss)" })
          .option("description", { type: "string", describe: "Requirement description" }),
      async (argv: AnyArgv) => {
        const result = await createReq(
          getRequiredString(argv, "title"),
          {
            id: getOptionalString(argv, "id"),
            description: getOptionalString(argv, "description"),
          },
          getContext(argv),
        )
        printJson(result)
      },
    )
    .command(
      "list-req",
      "List requirements",
      (builder: Argv) =>
        builder.option("status", {
          type: "string",
          describe: "planning|developing|completed",
        }),
      async (argv: AnyArgv) => {
        const result = await listReq({ status: getOptionalString(argv, "status") }, getContext(argv))
        printJson(result)
      },
    )
    .command(
      "get-req <id>",
      "Get requirement details",
      (builder: Argv) => builder.positional("id", { type: "string", describe: "Requirement id" }),
      async (argv: AnyArgv) => {
        const result = await getReq(getRequiredString(argv, "id"), getContext(argv))
        printJson(result)
      },
    )
    .command(
      "delete-req <id>",
      "Delete requirement",
      (builder: Argv) => builder.positional("id", { type: "string", describe: "Requirement id" }),
      async (argv: AnyArgv) => {
        const result = await deleteReq(getRequiredString(argv, "id"), getContext(argv))
        printJson(result)
      },
    )
    .command(
      "create-task",
      "Create task under requirement",
      (builder: Argv) =>
        builder
          .option("id", { type: "string", describe: "Task id (t_xxxxxx)" })
          .option("req", { type: "string", demandOption: true, describe: "Requirement id" })
          .option("title", { type: "string", demandOption: true, describe: "Task title" })
          .option("context", { type: "string", describe: "JSON array or comma string" })
          .option("tests", { type: "string", describe: "JSON array or comma string" })
          .option("constraints", { type: "string", describe: "JSON array or comma string" })
          .option("dependencies", { type: "string", describe: "JSON array or comma string" })
          .option("background", { type: "string", describe: "Task background chunk" }),
      async (argv: AnyArgv) => {
        const result = await createTask(
          {
            id: getOptionalString(argv, "id"),
            req: getRequiredString(argv, "req"),
            title: getRequiredString(argv, "title"),
            context: parseStringArray(getOptionalString(argv, "context")),
            tests: parseStringArray(getOptionalString(argv, "tests")),
            constraints: parseStringArray(getOptionalString(argv, "constraints")),
            dependencies: parseStringArray(getOptionalString(argv, "dependencies")),
            background: getOptionalString(argv, "background"),
          },
          getContext(argv),
        )
        printJson(result)
      },
    )
    .command(
      "list-task",
      "List tasks by requirement",
      (builder: Argv) =>
        builder
          .option("req", { type: "string", demandOption: true, describe: "Requirement id" })
          .option("status", { type: "string", describe: "todo|in_progress|done|blocked" }),
      async (argv: AnyArgv) => {
        const result = await listTask(
          {
            req: getRequiredString(argv, "req"),
            status: getOptionalString(argv, "status"),
          },
          getContext(argv),
        )
        printJson(result)
      },
    )
    .command(
      "get-task <id>",
      "Get task details",
      (builder: Argv) => builder.positional("id", { type: "string", describe: "Task id" }),
      async (argv: AnyArgv) => {
        const result = await getTask(getRequiredString(argv, "id"), getContext(argv))
        printJson(result)
      },
    )
    .command(
      "update-task <id>",
      "Update task",
      (builder: Argv) =>
        builder
          .positional("id", { type: "string", describe: "Task id" })
          .option("status", { type: "string", describe: "todo|in_progress|done|blocked" })
          .option("summary", { type: "string", describe: "Task result summary" })
          .option("set", { type: "string", describe: "JSON object" })
          .option("add", { type: "string", describe: "JSON object" })
          .option("remove", { type: "string", describe: "JSON object" }),
      async (argv: AnyArgv) => {
        const setPayload = parseObject<UpdateTaskSetPayload>(getOptionalString(argv, "set"))
        const addPayload = parseObject<UpdateTaskAddPayload>(getOptionalString(argv, "add"))
        const removePayload = parseObject<UpdateTaskRemovePayload>(getOptionalString(argv, "remove"))

        const result = await updateTask(
          getRequiredString(argv, "id"),
          {
            status: getOptionalStatus(argv),
            summary: getOptionalString(argv, "summary"),
            set: setPayload,
            add: addPayload,
            remove: removePayload,
          },
          getContext(argv),
        )
        printJson(result)
      },
    )
    .command(
      "delete-task <id>",
      "Delete task",
      (builder: Argv) => builder.positional("id", { type: "string", describe: "Task id" }),
      async (argv: AnyArgv) => {
        const result = await deleteTask(getRequiredString(argv, "id"), getContext(argv))
        printJson(result)
      },
    )
    .command(
      "get-task-prompt <id>",
      "Generate deterministic task prompt",
      (builder: Argv) => builder.positional("id", { type: "string", describe: "Task id" }),
      async (argv: AnyArgv) => {
        const result = await getTaskPrompt(getRequiredString(argv, "id"), getContext(argv))
        process.stdout.write(`${result}\n`)
      },
    )
    .strict()
    .demandCommand(1)
    .help("help")
    .alias("help", "h")
    .version()
    .alias("version", "v")
    .parseAsync()
}

run().catch((error) => {
  const message = error instanceof Error ? error.message : "Unknown error"
  process.stderr.write(`${message}\n`)
  process.exit(1)
})
