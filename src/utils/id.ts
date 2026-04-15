export function formatReqId(date: Date): string {
  const year = date.getFullYear().toString().padStart(4, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")
  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")
  const seconds = date.getSeconds().toString().padStart(2, "0")

  return `${year}${month}${day}${hours}${minutes}${seconds}`
}

export function createReqId(now: Date = new Date()): string {
  return formatReqId(now)
}

export function isReqId(value: string): boolean {
  return /^\d{14}$/.test(value)
}

export function isTaskId(value: string): boolean {
  return /^t_\d{6}$/.test(value)
}

export function createTaskId(existingTaskIds: string[]): string {
  const maxId = existingTaskIds.reduce((max, current) => {
    if (!isTaskId(current)) {
      return max
    }

    const numeric = Number.parseInt(current.slice(2), 10)
    return Number.isNaN(numeric) ? max : Math.max(max, numeric)
  }, 0)

  const next = (maxId + 1).toString().padStart(6, "0")
  return `t_${next}`
}
