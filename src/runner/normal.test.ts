import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Method } from '../types.js'

vi.mock('../applescript/index.js', () => ({
  getNoteIds: vi.fn(),
  getNoteBody: vi.fn(),
  moveNote: vi.fn(),
  createFolder: vi.fn(),
}))
vi.mock('../classifier/index.js', () => ({
  classifyNote: vi.fn(),
}))

const mockMethod: Method = {
  id: '5level', name: '5레벨', description: '', type: 'hierarchical',
  folders: [{ path: ['Work', 'Marketing'], keywords: ['릴스'] }],
}

describe('Normal Runner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('미처리 메모만 분류하고 이동한다', async () => {
    const { getNoteIds, getNoteBody, moveNote } = await import('../applescript/index.js')
    const { classifyNote } = await import('../classifier/index.js')

    vi.mocked(getNoteIds).mockResolvedValue([
      { id: 'id1', title: '릴스 기획', folder: '' },
      { id: 'id2', title: '이미처리됨', folder: 'Work' },
    ])
    vi.mocked(getNoteBody).mockResolvedValue('릴스 아이디어')
    vi.mocked(classifyNote).mockResolvedValue({
      noteId: 'id1', noteTitle: '릴스 기획',
      targetPath: ['Work', 'Marketing'], engine: 'keyword', success: true,
    })
    vi.mocked(moveNote).mockResolvedValue(true)

    const { runNormal } = await import('./normal.js')
    const result = await runNormal({
      processedIds: ['id2'],
      method: mockMethod,
      engine: 'keyword',
      dryRun: false,
      onProgress: vi.fn(),
    })

    expect(result.succeeded).toBe(1)
    expect(result.total).toBe(1)
    expect(moveNote).toHaveBeenCalledWith('id1', ['Work', 'Marketing'])
  })

  it('dryRun 모드에서는 moveNote를 호출하지 않는다', async () => {
    const { getNoteIds, getNoteBody, moveNote } = await import('../applescript/index.js')
    const { classifyNote } = await import('../classifier/index.js')

    vi.mocked(getNoteIds).mockResolvedValue([{ id: 'id1', title: '테스트', folder: '' }])
    vi.mocked(getNoteBody).mockResolvedValue('내용')
    vi.mocked(classifyNote).mockResolvedValue({
      noteId: 'id1', noteTitle: '테스트',
      targetPath: ['Work'], engine: 'keyword', success: true,
    })

    const { runNormal } = await import('./normal.js')
    await runNormal({
      processedIds: [],
      method: mockMethod,
      engine: 'keyword',
      dryRun: true,
      onProgress: vi.fn(),
    })

    expect(moveNote).not.toHaveBeenCalled()
  })
})
