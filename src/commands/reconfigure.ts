import * as clack from '@clack/prompts'
import { createStateManager } from '../state/index.js'
import { runSetup } from '../wizard/setup.js'

export async function reconfigureCommand(): Promise<void> {
  const action = await clack.select({
    message: '무엇을 변경하겠습니까?',
    options: [
      { value: 'method', label: '정리 방식 바꾸기' },
      { value: 'engine', label: 'AI 엔진 변경' },
      { value: 'reset', label: '전체 초기화' },
    ],
  })
  if (clack.isCancel(action)) { clack.cancel('취소됨'); return }

  const state = createStateManager()

  if (action === 'method') {
    const confirm = await clack.confirm({
      message: '방식을 바꾸면 processed.json이 초기화됩니다. 계속할까요?',
    })
    if (clack.isCancel(confirm) || !confirm) return
    await state.resetProcessed()
    await runSetup()
  }

  if (action === 'engine') {
    const config = await state.loadConfig()
    if (!config) { clack.log.error('설정 없음. ano setup을 먼저 실행하세요.'); return }

    const engine = await clack.select({
      message: 'AI 엔진을 선택하세요',
      options: [
        { value: 'claude-cli', label: 'Claude CLI' },
        { value: 'keyword', label: '키워드 매칭만' },
      ],
    })
    if (clack.isCancel(engine)) return
    await state.saveConfig({ ...config, ai_engine: engine as 'claude-cli' | 'keyword' })
    clack.log.success('AI 엔진 변경 완료')
  }

  if (action === 'reset') {
    const confirm = await clack.confirm({
      message: '모든 설정과 처리 이력이 삭제됩니다. 정말 초기화하겠습니까?',
      initialValue: false,
    })
    if (clack.isCancel(confirm) || !confirm) return
    await state.resetProcessed()
    await runSetup()
  }
}
