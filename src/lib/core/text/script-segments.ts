const CJK_PATTERN = /[぀-ヿ㐀-䶿一-鿿豈-﫿＀-￯]/

// resvg resolves font-family per <text> chunk, not per glyph: a mixed-script string handed a
// font-family fallback list silently loses styling for the *entire* chunk, Latin included, when
// no single listed font covers every character. Callers use this to route mixed-script text to
// one CJK-capable font instead of a fallback list.
export function containsCjk(text: string): boolean {
  return CJK_PATTERN.test(text)
}
