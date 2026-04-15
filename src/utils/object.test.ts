import { describe, expect, it } from "bun:test"

import { addUniqueItems, removeItems, setDefinedValue } from "@/utils/object.js"

describe("utils/object", () => {
  it("sets defined value immutably", () => {
    const source = { a: 1, b: "x" }
    const result = setDefinedValue(source, "b", "y")

    expect(result).toEqual({ a: 1, b: "y" })
    expect(source).toEqual({ a: 1, b: "x" })
  })

  it("returns same reference when value is undefined", () => {
    const source = { a: 1 }
    const result = setDefinedValue(source, "a", undefined)

    expect(result).toBe(source)
  })

  it("adds unique items only", () => {
    expect(addUniqueItems(["a", "b"], ["b", "c"])).toEqual(["a", "b", "c"])
  })

  it("removes listed items", () => {
    expect(removeItems(["a", "b", "c"], ["b"])).toEqual(["a", "c"])
  })
})
