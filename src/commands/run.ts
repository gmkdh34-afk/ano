import * as clack from '@clack/prompts'
import { createStateManager } from '../state/index.js'
import { loadMethod } from '../methods/index.js'
import { runNormal } from '../runner/normal.js'
import { runBatch } from '../runner/batch.js'
import type { ClassificationResult } from '../types.js'

const BATCH_THRESHOLD = 50

interface RunOptions {
  dryRun: boolean
  batchSize: number
  verbose: boolean
}

export async function runCommand(options: RunOptions): Promise<void> {
  const state = createStateManager()
  const config = await state.loadConfig()

  if (!config) {
    clack.log.error('설정이 없습니다. 먼저 ano setup을 실행하세요.')
    process.exit(1)
  }

  if (options.dryRun) {
    clack.log.warn('DRY-RUN 모드 — 실제 이동 없음')
  }

  const method = await loadMethod(config.method)
  const processedIds = await state.getProcessedIds()

  const spinner = clack.spinner()
  spinner.start('Apple Notes 스캔 중...')

  const onProgress = (_current: number, _total: number, result: ClassificationResult) => {
    const icon = result.engine === 'claude-cli' ? '✓' : '?'
    spinner.message(
      `${icon}  ${result.noteTitle.slice(0, 40)} → ${result.targetPath.join('/')}`
    )
  }

  const onBatchProgress = (batchNum: number, totalBatches: number) => {
    spinner.message(`배치 ${batchNum}/${totalBatches} 처리 중...`)
  }

  let result
  const { getNoteIds } = await import('../applescript/index.js')
  const allNotes = await getNoteIds()
  const processedSet = new Set(processedIds)
  const unprocessedCount = allNotes.filter((n) => !processedSet.has(n.id)).length

  spinner.message(
    `전체: ${allNotes.length}개 / 미처리: ${unprocessedCount}개` +
    (unprocessedCount > BATCH_THRESHOLD ? ' → 배치 모드 자동 전환' : '')
  )

  if (unprocessedCount > BATCH_THRESHOLD) {
    result = await runBatch({
      processedIds,
      method,
      engine: config.ai_engine,
      dryRun: options.dryRun,
      batchSize: options.batchSize,
      onBatchProgress,
      onProgress,
    })
  } else {
    result = await runNormal({
      processedIds,
      method,
      engine: config.ai_engine,
      dryRun: options.dryRun,
      onProgress,
    })
  }

  spinner.stop('완료')

  if (!options.dryRun) {
    const succeededIds = result.results.filter((r) => r.success).map((r) => r.noteId)
    await state.addProcessedIds(succeededIds)
  }

  if (options.verbose || options.dryRun) {
    for (const r of result.results) {
      clack.log.info(`${r.noteTitle} → ${r.targetPath.join('/')}`)
    }
  }

  clack.log.success(
    `${result.succeeded}개 완료 | ${result.failed}개 실패 | ${result.skipped}개 스킵 | ${(result.durationMs / 1000).toFixed(1)}초`
  )
}
