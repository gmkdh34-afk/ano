import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtemp, rm } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'

describe('State Manager', () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'ano-test-'))
  })

  afterEach(async () => {
    await rm(tempDir, { recursive: true })
  })

  it('getProcessedIds: 파일 없으면 빈 배열 반환', async () => {
    const { createStateManager } = await import('./index.js')
    const state = createStateManager(tempDir)
    const ids = await state.getProcessedIds()
    expect(ids).toEqual([])
  })

  it('addProcessedIds: ID 저장 후 다시 읽으면 포함됨', async () => {
    const { createStateManager } = await import('./index.js')
    const state = createStateManager(tempDir)
    await state.addProcessedIds(['id1', 'id2'])
    const ids = await state.getProcessedIds()
    expect(ids).toContain('id1')
    expect(ids).toContain('id2')
  })

  it('addProcessedIds: 중복 ID는 한 번만 저장', async () => {
    const { createStateManager } = await import('./index.js')
    const state = createStateManager(tempDir)
    await state.addProcessedIds(['id1'])
    await state.addProcessedIds(['id1', 'id2'])
    const ids = await state.getProcessedIds()
    expect(ids.filter((id) => id === 'id1')).toHaveLength(1)
  })

  it('saveConfig / loadConfig: 설정 저장 후 읽기', async () => {
    const { createStateManager } = await import('./index.js')
    const state = createStateManager(tempDir)
    await state.saveConfig({ method: '5level', ai_engine: 'claude-cli', created_at: '2026-03-30' })
    const config = await state.loadConfig()
    expect(config?.method).toBe('5level')
    expect(config?.ai_engine).toBe('claude-cli')
  })

  it('loadConfig: 파일 없으면 null 반환', async () => {
    const { createStateManager } = await import('./index.js')
    const state = createStateManager(tempDir)
    const config = await state.loadConfig()
    expect(config).toBeNull()
  })
})
