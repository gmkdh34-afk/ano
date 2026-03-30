import type { Method } from '../types.js'

export function classifyByKeyword(text: string, method: Method): string[] | null {
  const lowerText = text.toLowerCase()

  let bestMatch: { path: string[]; count: number } | null = null

  for (const folder of method.folders) {
    if (folder.keywords.length === 0) continue
    const matchCount = folder.keywords.filter((kw) =>
      lowerText.includes(kw.toLowerCase())
    ).length
    if (matchCount > 0) {
      if (!bestMatch || matchCount > bestMatch.count) {
        bestMatch = { path: folder.path, count: matchCount }
      }
    }
  }

  return bestMatch?.path ?? null
}
