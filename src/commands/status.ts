import * as clack from '@clack/prompts'
import { createStateManager } from '../state/index.js'
import { loadMethod } from '../methods/index.js'
import { testConnection } from '../classifier/claude-cli.js'
import { getScheduleStatus } from '../scheduler/index.js'
import { getNoteIds } from '../applescript/index.js'

export async function statusCommand(): Promise<void> {
  const state = createStateManager()
  const config = await state.loadConfig()

  if (!config) {
    clack.log.warn('설정이 없습니다. ano setup을 먼저 실행하세요.')
    return
  }

  const method = await loadMethod(config.method)
  const processedIds = await state.getProcessedIds()
  const lastRun = await state.getLastRun()
  const schedule = await getScheduleStatus()
  const allNotes = await getNoteIds()
  const unprocessedCount = allNotes.filter((n) => !processedIds.includes(n.id)).length

  let engineStatus = config.ai_engine === 'keyword' ? '키워드 매칭' : 'Claude CLI'
  if (config.ai_engine === 'claude-cli') {
    const connected = await testConnection()
    engineStatus += connected ? ' ✓ 연결됨' : ' ✗ 연결 안 됨'
  }

  clack.log.message(
    [
      `정리 방식   ${method.name}`,
      `AI 엔진     ${engineStatus}`,
      `스케줄      ${schedule.active ? `매일 ${schedule.time} ✓ 등록됨` : '미등록'}`,
      '',
      `마지막 실행  ${lastRun ? new Date(lastRun).toLocaleString('ko-KR') : '없음'}`,
      `처리된 메모  총 ${processedIds.length}개`,
      `미처리 메모  ${unprocessedCount}개${unprocessedCount > 0 ? '  (ano run 으로 처리)' : ''}`,
    ].join('\n')
  )
}
