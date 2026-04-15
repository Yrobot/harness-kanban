export function parseStringArray(value: string | undefined): string[] {
  if (!value) {
    return []
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return []
  }

  if (trimmed.startsWith("[")) {
    const parsed = JSON.parse(trimmed)
    if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== "string")) {
      throw new Error("Expected a JSON string array")
    }

    return parsed
  }

  return trimmed
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

export function parseObject<T extends object>(value: string | undefined): T | undefined {
  if (!value) {
    return undefined
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return undefined
  }

  const parsed = JSON.parse(trimmed)
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("Expected a JSON object")
  }

  return parsed as T
}
