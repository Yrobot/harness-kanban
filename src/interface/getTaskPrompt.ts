import { findTaskInRequirement, readRequirement } from "@/core/storage.js"
import { assertTaskId } from "@/core/validators.js"
import type { CommandContext } from "@/core/types.js"

function buildBulletList(items: string[]): string {
  if (items.length === 0) {
    return "- 无"
  }

  return items.map((item) => `- ${item}`).join("\n")
}

function buildDependencySection(dependencySummaries: string[]): string {
  if (dependencySummaries.length === 0) {
    return "无"
  }

  return dependencySummaries
    .map((summary, index) => `### 依赖任务 ${index + 1}\n${summary}`)
    .join("\n\n")
}

export async function getTaskPrompt(
  taskId: string,
  reqId: string,
  context: CommandContext = {},
): Promise<string> {
  assertTaskId(taskId)

  const requirement = await readRequirement(context, reqId)
  const task = findTaskInRequirement(requirement, taskId)
  if (!task) {
    throw new Error(`Task not found: ${taskId}`)
  }

  const dependencySummaries: string[] = []

  for (const dependencyId of task.dependencies) {
    const dependency = findTaskInRequirement(requirement, dependencyId)
    if (!dependency) {
      dependencySummaries.push(`依赖任务 ${dependencyId} 不存在`)
      continue
    }

    dependencySummaries.push(
      dependency.result_summary ?? `依赖任务 ${dependencyId} 暂无 result_summary`,
    )
  }

  return [
    "## 需求背景",
    requirement.description || "无",
    "",
    "## 当前任务",
    `- req_id: ${requirement.id}`,
    `- task_id: ${task.id}`,
    `- title: ${task.title}`,
    "",
    "## 上下文映射",
    buildBulletList(task.context_mapping),
    "",
    "## 约束条件",
    buildBulletList(task.constraints),
    "",
    "## 输出要求",
    "- 产出实现代码与必要测试",
    "- 保持与 README 约束一致",
    "",
    "## 执行步骤",
    task.background_chunk || "- 无",
    "",
    "## 依赖任务产出",
    buildDependencySection(dependencySummaries),
    "",
    "## 验证清单",
    buildBulletList(task.verification_steps),
  ].join("\n")
}
