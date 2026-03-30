import { describe, it, expect } from 'vitest'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const METHODS_DIR = resolve(__dirname, '../../methods')

describe('Method Loader', () => {
  it('loadMethod: 5level 방식을 로드한다', async () => {
    const { loadMethod } = await import('./index.js')
    const method = await loadMethod('5level', METHODS_DIR)
    expect(method.id).toBe('5level')
    expect(method.name).toBe('5레벨 폴더법')
    expect(method.folders.length).toBeGreaterThan(0)
  })

  it('loadMethod: 존재하지 않는 방식이면 에러', async () => {
    const { loadMethod } = await import('./index.js')
    await expect(loadMethod('nonexistent', METHODS_DIR)).rejects.toThrow()
  })

  it('listMethods: methods 디렉토리의 모든 방식 목록 반환', async () => {
    const { listMethods } = await import('./index.js')
    const methods = await listMethods(METHODS_DIR)
    const ids = methods.map((m) => m.id)
    expect(ids).toContain('5level')
    expect(ids).toContain('para')
    expect(ids).toContain('zettelkasten')
  })

  it('listMethods: template.yaml은 목록에서 제외', async () => {
    const { listMethods } = await import('./index.js')
    const methods = await listMethods(METHODS_DIR)
    const ids = methods.map((m) => m.id)
    expect(ids).not.toContain('my-method')
  })
})
