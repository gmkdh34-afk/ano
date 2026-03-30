import { getNoteIds, getNoteBody, moveNote } from '../applescript/index.js'
import { classifyNote } from '../classifier/index.js'
import type { Method, RunResult, ClassificationResult } from '../types.js'

interface NormalRunOptions {
  processedIds: string[]
  method: Method
  engine: 'claude-cli' | 'keyword'
  dryRun: boolean
  onProgress: (current: number, total: number, result: ClassificationResult) => void
}

export async function runNormal(options: NormalRunOptions): Promise<RunResult> {
  const { processedIds, method, engine, dryRun, onProgress } = options
  const start = Date.now()

  const allNotes = await getNoteIds()
  const unprocessed = allNotes.filter((n) => !processedIds.includes(n.id))
  const total = unprocessed.length

  const results: ClassificationResult[] = []
  let succeeded = 0
  let failed = 0

  for (let i = 0; i < unprocessed.length; i++) {
    const note = unprocessed[i]
    const body = await getNoteBody(note.id)
    const classified = await classifyNote({ ...note, body }, method, engine)

    if (!dryRun) {
      const moved = await moveNote(note.id, classified.targetPath)
      if (moved) succeeded++
      else failed++
    } else {
      succeeded++
    }

    results.push(classified)
    onProgress(i + 1, total, classified)
  }

  return { total, succeeded, failed, skipped: 0, durationMs: Date.now() - start, results }
}
