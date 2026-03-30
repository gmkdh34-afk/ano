import { getNotesBatch, getTotalNoteCount, moveNote } from '../applescript/index.js'
import { classifyNote } from '../classifier/index.js'
import type { Method, RunResult, ClassificationResult } from '../types.js'

interface BatchRunOptions {
  processedIds: string[]
  method: Method
  engine: 'claude-cli' | 'keyword'
  dryRun: boolean
  batchSize: number
  onBatchProgress: (batchNum: number, totalBatches: number) => void
  onProgress: (current: number, total: number, result: ClassificationResult) => void
}

export async function runBatch(options: BatchRunOptions): Promise<RunResult> {
  const { processedIds, method, engine, dryRun, batchSize, onBatchProgress, onProgress } = options
  const start = Date.now()

  const totalCount = await getTotalNoteCount()
  const totalBatches = Math.ceil(totalCount / batchSize)

  const results: ClassificationResult[] = []
  let succeeded = 0
  let failed = 0
  let skipped = 0
  let globalIndex = 0

  for (let batch = 0; batch < totalBatches; batch++) {
    const offset = batch * batchSize
    onBatchProgress(batch + 1, totalBatches)

    const notes = await getNotesBatch(offset, batchSize)
    const unprocessed = notes.filter((n) => !processedIds.includes(n.id))
    skipped += notes.length - unprocessed.length

    for (const note of unprocessed) {
      const classified = await classifyNote(
        { ...note, body: note.body ?? '' },
        method,
        engine
      )

      if (!dryRun) {
        const moved = await moveNote(note.id, classified.targetPath)
        if (moved) succeeded++
        else failed++
      } else {
        succeeded++
      }

      results.push(classified)
      onProgress(++globalIndex, totalCount, classified)
    }
  }

  return {
    total: succeeded + failed + skipped,
    succeeded,
    failed,
    skipped,
    durationMs: Date.now() - start,
    results,
  }
}
