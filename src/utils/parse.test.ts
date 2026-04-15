import { describe, expect, it } from "bun:test"

import { parseObject, parseStringArray } from "@/utils/parse.js"

describe("utils/parse", () => {
  const stringArrayCases: Array<{ input: string | undefined; expected: string[] }> = [
    { input: undefined, expected: [] },
    { input: "", expected: [] },
    { input: "a,b", expected: ["a", "b"] },
    { input: "a, b,  c", expected: ["a", "b", "c"] },
    { input: '["x","y"]', expected: ["x", "y"] },
  ]

  it.each(stringArrayCases)("parses string array: $input", ({ input, expected }) => {
    expect(parseStringArray(input)).toEqual(expected)
  })

  it("throws when json array contains non-string", () => {
    expect(() => parseStringArray('["ok",1]')).toThrow("Expected a JSON string array")
  })

  it("parses json object", () => {
    expect(parseObject<{ a: string }>("{\"a\":\"b\"}")).toEqual({ a: "b" })
    expect(parseObject<{ a: string }>(undefined)).toBeUndefined()
  })

  it("throws when object parser receives array", () => {
    expect(() => parseObject("[]")).toThrow("Expected a JSON object")
  })
})
