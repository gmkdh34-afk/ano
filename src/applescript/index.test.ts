import { describe, it, expect, vi, beforeEach } from 'vitest'
import { execFile } from 'child_process'

vi.mock('child_process', () => ({
  execFile: vi.fn(),
}))

describe('AppleScript Bridge', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('getNoteIds: 출력을 Note 배열로 파싱한다', async () => {
    const mockOutput = 'id1|||제목1|||폴더A\nid2|||제목2|||폴더B\n'
    vi.mocked(execFile).mockImplementation((_cmd, _args, cb: any) => {
      cb(null, mockOutput, '')
    })

    const { getNoteIds } = await import('./index.js')
    const notes = await getNoteIds()
    expect(notes).toEqual([
      { id: 'id1', title: '제목1', folder: '폴더A' },
      { id: 'id2', title: '제목2', folder: '폴더B' },
    ])
  })

  it('getNoteBody: 특정 메모 본문을 반환한다', async () => {
    vi.mocked(execFile).mockImplementation((_cmd, _args, cb: any) => {
      cb(null, '삼성전자 PER 분석 내용', '')
    })

    const { getNoteBody } = await import('./index.js')
    const body = await getNoteBody('id1')
    expect(body).toBe('삼성전자 PER 분석 내용')
  })

  it('moveNote: 에러 없이 완료되면 true를 반환한다', async () => {
    vi.mocked(execFile).mockImplementation((_cmd, _args, cb: any) => {
      cb(null, '', '')
    })

    const { moveNote } = await import('./index.js')
    const result = await moveNote('id1', ['00_Personal', '02_Study'])
    expect(result).toBe(true)
  })

  it('moveNote: AppleScript 실패 시 false를 반환한다', async () => {
    vi.mocked(execFile).mockImplementation((_cmd, _args, cb: any) => {
      cb(new Error('AppleScript error'), '', 'error')
    })

    const { moveNote } = await import('./index.js')
    const result = await moveNote('id1', ['존재하지않는폴더'])
    expect(result).toBe(false)
  })

  it('getNotesBatch: TOTAL: 라인을 제외하고 본문 포함 Note 배열 반환', async () => {
    const mockOutput = 'TOTAL:100\nid1|||제목1|||폴더A|||본문내용1\nid2|||제목2|||폴더B|||본문내용2\n'
    vi.mocked(execFile).mockImplementation((_cmd, _args, cb: any) => {
      cb(null, mockOutput, '')
    })

    const { getNotesBatch } = await import('./index.js')
    const notes = await getNotesBatch(0, 50)
    expect(notes).toEqual([
      { id: 'id1', title: '제목1', folder: '폴더A', body: '본문내용1' },
      { id: 'id2', title: '제목2', folder: '폴더B', body: '본문내용2' },
    ])
    expect(notes).toHaveLength(2)
  })

  it('getTotalNoteCount: TOTAL:N 에서 숫자 파싱', async () => {
    const mockOutput = 'TOTAL:247\nid1|||제목1|||폴더A|||본문\n'
    vi.mocked(execFile).mockImplementation((_cmd, _args, cb: any) => {
      cb(null, mockOutput, '')
    })

    const { getTotalNoteCount } = await import('./index.js')
    const count = await getTotalNoteCount()
    expect(count).toBe(247)
  })
})
