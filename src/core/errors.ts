export interface NormalizedError {
  code: string
  message: string
}

const DEFAULT_MESSAGE = "Unknown error"

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message || DEFAULT_MESSAGE
  }

  if (typeof error === "string") {
    const trimmed = error.trim()
    return trimmed.length > 0 ? trimmed : DEFAULT_MESSAGE
  }

  if (error === null || error === undefined) {
    return DEFAULT_MESSAGE
  }

  try {
    const serialized = JSON.stringify(error)
    if (serialized && serialized !== "{}") {
      return serialized
    }
  } catch {
    // ignore serialization errors and fallback to String(value)
  }

  const fallback = String(error)
  return fallback && fallback !== "[object Object]" ? fallback : DEFAULT_MESSAGE
}

function inferErrorCode(message: string): string {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes("not found")) {
    return "NOT_FOUND"
  }

  if (lowerMessage.includes("already exists")) {
    return "ALREADY_EXISTS"
  }

  if (
    lowerMessage.includes("invalid")
    || lowerMessage.includes("missing required")
    || lowerMessage.includes("unknown argument")
    || lowerMessage.includes("not enough non-option arguments")
    || lowerMessage.includes("enoent")
  ) {
    return "INVALID_INPUT"
  }

  if (
    lowerMessage.includes("json")
    || lowerMessage.includes("unexpected token")
    || lowerMessage.includes("unterminated string")
  ) {
    return "INVALID_JSON"
  }

  return "INTERNAL_ERROR"
}

export function normalizeError(error: unknown): NormalizedError {
  const message = getErrorMessage(error)

  return {
    code: inferErrorCode(message),
    message,
  }
}

export function formatError(error: unknown): string {
  const normalized = normalizeError(error)
  return `[${normalized.code}] ${normalized.message}`
}
