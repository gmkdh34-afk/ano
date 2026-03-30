import { describe, it, expect } from 'vitest'

describe('Scheduler', () => {
  it('generatePlist: 올바른 plist XML 생성', async () => {
    const { generatePlist } = await import('./index.js')
    const plist = generatePlist({ hour: 9, minute: 0, scriptPath: '/usr/bin/ano' })
    expect(plist).toContain('com.ano.run')
    expect(plist).toContain('<integer>9</integer>')
    expect(plist).toContain('/usr/bin/ano')
  })
})
