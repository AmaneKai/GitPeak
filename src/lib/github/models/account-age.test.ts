import { expect, test, describe } from "bun:test"
import { accountAge } from "./account-age"

describe("account-age", () => {
  test("formats multi-year age correctly", () => {
    // Mocking 1 year and 2 months ago
    const pastDate = new Date()
    pastDate.setFullYear(pastDate.getFullYear() - 1)
    pastDate.setMonth(pastDate.getMonth() - 2)
    
    expect(accountAge(pastDate.toISOString())).toBe("1 yr 2 mos")
  })

  test("formats less than a year correctly", () => {
    // Mocking 4 months ago
    const pastDate = new Date()
    pastDate.setMonth(pastDate.getMonth() - 4)
    
    expect(accountAge(pastDate.toISOString())).toBe("4 months")
  })
})
