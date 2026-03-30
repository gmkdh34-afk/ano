import { describe, it, expect } from 'vitest'
import type { Method } from '../types.js'

const mockMethod: Method = {
  id: 'test',
  name: 'Test',
  description: '',
  type: 'hierarchical',
  folders: [
    { path: ['Work', 'Marketing'], keywords: ['인스타', '릴스', '콘텐츠'] },
    { path: ['Study', 'Investment'], keywords: ['주식', 'ETF', '배당'] },
    { path: ['Personal', 'ETC'], keywords: [] },
  ],
}

describe('Keyword Classifier', () => {
  it('키워드가 정확히 일치하면 해당 폴더 반환', async () => {
    const { classifyByKeyword } = await import('./keyword.js')
    const result = classifyByKeyword('삼성전자 주식 PER 분석', mockMethod)
    expect(result).toEqual(['Study', 'Investment'])
  })

  it('대소문자 구분 없이 매칭', async () => {
    const { classifyByKeyword } = await import('./keyword.js')
    const result = classifyByKeyword('인스타그램 릴스 기획', mockMethod)
    expect(result).toEqual(['Work', 'Marketing'])
  })

  it('키워드 없는 ETC 폴더는 매칭 안 됨', async () => {
    const { classifyByKeyword } = await import('./keyword.js')
    const result = classifyByKeyword('완전히 관련 없는 내용', mockMethod)
    expect(result).toBeNull()
  })

  it('여러 폴더에 키워드가 겹치면 키워드 수 많은 폴더 우선', async () => {
    const { classifyByKeyword } = await import('./keyword.js')
    const result = classifyByKeyword('인스타 릴스 콘텐츠 전략', mockMethod)
    expect(result).toEqual(['Work', 'Marketing'])
  })
})
