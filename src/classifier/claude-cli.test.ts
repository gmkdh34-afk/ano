import { describe, it, expect, vi, beforeEach } from 'vitest'
import { execFile } from 'child_process'

vi.mock('child_process', () => ({ execFile: vi.fn() }))

describe('Claude CLI Classifier', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('Claude CLI 출력을 폴더 경로 배열로 파싱한다', async () => {
    vi.mocked(execFile).mockImplementation((_cmd, _args, cb: any) => {
      cb(null, '00_Personal/02_Study/02_Investment', '')
    })
    const { classifyByClaude } = await import('./claude-cli.js')
    const result = await classifyByClaude('삼성전자 PER 분석', ['00_Personal/02_Study/02_Investment'])
    expect(result).toEqual(['00_Personal', '02_Study', '02_Investment'])
  })

  it('Claude CLI 실패 시 null 반환', async () => {
    vi.mocked(execFile).mockImplementation((_cmd, _args, cb: any) => {
      cb(new Error('claude not found'), '', '')
    })
    const { classifyByClaude } = await import('./claude-cli.js')
    const result = await classifyByClaude('내용', ['폴더1'])
    expect(result).toBeNull()
  })

  it('testConnection: claude 명령 성공하면 true', async () => {
    vi.mocked(execFile).mockImplementation((_cmd, _args, cb: any) => {
      cb(null, 'claude 1.0.0', '')
    })
    const { testConnection } = await import('./claude-cli.js')
    expect(await testConnection()).toBe(true)
  })

  it('testConnection: claude 명령 실패하면 false', async () => {
    vi.mocked(execFile).mockImplementation((_cmd, _args, cb: any) => {
      cb(new Error('not found'), '', '')
    })
    const { testConnection } = await import('./claude-cli.js')
    expect(await testConnection()).toBe(false)
  })
})
