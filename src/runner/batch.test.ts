import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Method } from '../types.js'

vi.mock('../applescript/index.js', () => ({
  getNotesBatch: vi.fn(),
  getTotalNoteCount: vi.fn(),
  moveNote: vi.fn(),
  createFolder: vi.fn(),
}))
vi.mock('../classifier/index.js', () => ({
  classifyNote: vi.fn(),
}))

const mockMethod: Method = {
  id: '5level', name: '5레벨', description: '', type: 'hierarchical',
  folders: [{ path: ['Work'], keywords: ['업무'] }],
}

describe('Batch Runner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('50개씩 끊어서 처리하고 총 결과를 합산한다', async () => {
    const { getNotesBatch, getTotalNoteCount, moveNote } = await import('../applescript/index.js')
    const { classifyNote } = await import('../classifier/index.js')

    vi.mocked(getTotalNoteCount).mockResolvedValue(60)
    vi.mocked(getNotesBatch).mockResolvedValueOnce(
      Array.from({ length: 50 }, (_, i) => ({
        id: `id${i}`, title: `메모${i}`, folder: '', body: '내용',
      }))
    )
    vi.mocked(getNotesBatch).mockResolvedValueOnce(
      Array.from({ length: 10 }, (_, i) => ({
        id: `id${i + 50}`, title: `메모${i + 50}`, folder: '', body: '내용',
      }))
    )
    vi.mocked(classifyNote).mockResolvedValue({
      noteId: 'x', noteTitle: 'x', targetPath: ['Work'], engine: 'keyword', success: true,
    })
    vi.mocked(moveNote).mockResolvedValue(true)

    const { runBatch } = await import('./batch.js')
    const result = await runBatch({
      processedIds: [],
      method: mockMethod,
      engine: 'keyword',
      dryRun: false,
      batchSize: 50,
      onBatchProgress: vi.fn(),
      onProgress: vi.fn(),
    })

    expect(result.total).toBe(60)
    expect(result.succeeded).toBe(60)
  })

  it('이미 처리된 ID는 건너뛴다', async () => {
    const { getNotesBatch, getTotalNoteCount, moveNote } = await import('../applescript/index.js')
    const { classifyNote } = await import('../classifier/index.js')

    vi.mocked(getTotalNoteCount).mockResolvedValue(2)
    vi.mocked(getNotesBatch).mockResolvedValueOnce([
      { id: 'processed', title: '이미처리', folder: '', body: '' },
      { id: 'new', title: '새메모', folder: '', body: '내용' },
    ])
    vi.mocked(classifyNote).mockResolvedValue({
      noteId: 'new', noteTitle: '새메모', targetPath: ['Work'], engine: 'keyword', success: true,
    })
    vi.mocked(moveNote).mockResolvedValue(true)

    const { runBatch } = await import('./batch.js')
    const result = await runBatch({
      processedIds: ['processed'],
      method: mockMethod,
      engine: 'keyword',
      dryRun: false,
      batchSize: 50,
      onBatchProgress: vi.fn(),
      onProgress: vi.fn(),
    })

    expect(result.skipped).toBe(1)
    expect(result.succeeded).toBe(1)
  })
})
