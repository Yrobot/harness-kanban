import { describe, expect, it } from "bun:test"

import { parseObject, parseStringArray } from "@/utils/parse.js"

describe("utils/parse", () => {
  const stringArrayCases: Array<{ input: string | undefined; expected: string[] }> = [
    { input: undefined, expected: [] },
    { input: "", expected: [] },
    { input: "   ", expected: [] },
    { input: "a,b", expected: ["a", "b"] },
    { input: "a, b,  c", expected: ["a", "b", "c"] },
    { input: "a, , b,   ", expected: ["a", "b"] },
    { input: '["x","y"]', expected: ["x", "y"] },
  ]

  it.each(stringArrayCases)("parses string array: $input", ({ input, expected }) => {
    expect(parseStringArray(input)).toEqual(expected)
  })

  it.each([
    { input: "{}", expected: ["{}"] as string[] },
    { input: '["ok",1]', message: "Expected a JSON string array" },
  ])("throws or returns for string array input %#", ({ input, message, expected }) => {
    if (message) {
      expect(() => parseStringArray(input)).toThrow(message)
      return
    }

    expect(parseStringArray(input)).toEqual(expected)
  })

  it.each([
    { input: undefined, expected: undefined },
    { input: "", expected: undefined },
    { input: "  ", expected: undefined },
    { input: '{"a":"b"}', expected: { a: "b" } },
  ])("parses object input %#", ({ input, expected }) => {
    expect(parseObject<{ a: string }>(input)).toEqual(expected)
  })

  it.each([
    { input: "{bad}" },
    { input: "null", message: "Expected a JSON object" },
    { input: "[]", message: "Expected a JSON object" },
  ])("throws for invalid object input %#", ({ input, message }) => {
    if (message) {
      expect(() => parseObject(input)).toThrow(message)
      return
    }

    expect(() => parseObject(input)).toThrow()
  })
})

