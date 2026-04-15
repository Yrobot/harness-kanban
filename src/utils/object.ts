export function setDefinedValue<T extends Record<string, unknown>, K extends keyof T>(
  source: T,
  key: K,
  value: T[K] | undefined,
): T {
  if (value === undefined) {
    return source
  }

  return {
    ...source,
    [key]: value,
  }
}

export function addUniqueItems(source: string[], values: string[] | undefined): string[] {
  if (!values || values.length === 0) {
    return source
  }

  const merged = [...source]
  values.forEach((item) => {
    if (!merged.includes(item)) {
      merged.push(item)
    }
  })

  return merged
}

export function removeItems(source: string[], values: string[] | undefined): string[] {
  if (!values || values.length === 0) {
    return source
  }

  const removeSet = new Set(values)
  return source.filter((item) => !removeSet.has(item))
}
