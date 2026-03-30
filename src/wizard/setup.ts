import * as clack from '@clack/prompts'
import { pickMethod } from './method-picker.js'
import { buildFolders, renderFolderTree } from './folder-builder.js'
import { testConnection } from '../classifier/claude-cli.js'
import { createFolder } from '../applescript/index.js'
import { createStateManager } from '../state/index.js'
import type { Config, Folder } from '../types.js'

export async function runSetup(): Promise<void> {
  clack.intro('ano  Apple Notes Organizer')

  const method = await pickMethod()

  let folders: Folder[] = []
  let confirmed = false

  while (!confirmed) {
    folders = await buildFolders(method)
    clack.log.message('생성될 폴더 구조:\n' + renderFolderTree(folders))

    const action = await clack.select({
      message: '어떻게 하겠습니까?',
      options: [
        { value: 'confirm', label: '이대로 진행' },
        { value: 'restart', label: '처음부터 다시' },
      ],
    })
    if (clack.isCancel(action)) { clack.cancel('취소됨'); process.exit(0) }
    confirmed = action === 'confirm'
  }

  const engineChoice = await clack.select({
    message: '메모 분류에 사용할 AI를 선택하세요',
    options: [
      { value: 'claude-cli', label: 'Claude CLI', hint: 'Claude Pro/Max 구독 포함 (추가 비용 없음)' },
      { value: 'keyword', label: '키워드 매칭만', hint: '완전 무료' },
    ],
  })
  if (clack.isCancel(engineChoice)) { clack.cancel('취소됨'); process.exit(0) }

  const engine = engineChoice as 'claude-cli' | 'keyword'

  if (engine === 'claude-cli') {
    const spinner = clack.spinner()
    spinner.start('Claude CLI 연결 확인 중...')
    const ok = await testConnection()
    if (ok) {
      spinner.stop('Claude CLI 연결 확인됨')
    } else {
      spinner.stop('Claude CLI를 찾을 수 없습니다. 키워드 매칭으로 대체합니다.')
    }
  }

  const spinner = clack.spinner()
  spinner.start('Apple Notes에 폴더 생성 중...')

  const pathsToCreate = new Set<string>()
  for (const folder of folders) {
    for (let i = 1; i <= folder.path.length; i++) {
      pathsToCreate.add(folder.path.slice(0, i).join('/'))
    }
  }
  const sortedPaths = Array.from(pathsToCreate).sort((a, b) => a.split('/').length - b.split('/').length)

  let created = 0
  for (const pathStr of sortedPaths) {
    const pathArr = pathStr.split('/')
    await createFolder(pathArr)
    created++
    spinner.message(`폴더 생성 중... (${created}/${sortedPaths.length})`)
  }
  spinner.stop(`폴더 ${created}개 생성 완료`)

  const config: Config = {
    method: method.id,
    ai_engine: engine,
    created_at: new Date().toISOString(),
  }
  const stateManager = createStateManager()
  await stateManager.saveConfig(config)

  const scheduleNow = await clack.confirm({
    message: '자동 실행 스케줄을 지금 설정하겠습니까? (나중에 ano schedule로도 가능)',
    initialValue: false,
  })

  if (!clack.isCancel(scheduleNow) && scheduleNow) {
    const { setupSchedule } = await import('../scheduler/index.js')
    await setupSchedule()
  }

  clack.outro(
    `설정 완료!\n  정리 방식: ${method.name}\n  AI 엔진: ${engine}\n\n  ano run --dry-run  ← 먼저 미리보기 추천\n  ano run            ← 바로 정리 시작`
  )
}
