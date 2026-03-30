import { execFile } from 'child_process'

function execFileAsync(cmd: string, args: string[]): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, (err, stdout, stderr) => {
      if (err) reject(err)
      else resolve({ stdout: stdout.toString(), stderr: stderr.toString() })
    })
  })
}

export async function testConnection(): Promise<boolean> {
  try {
    await execFileAsync('claude', ['--version'])
    return true
  } catch {
    return false
  }
}

export async function classifyByClaude(
  noteText: string,
  availablePaths: string[]
): Promise<string[] | null> {
  const prompt = [
    '다음 메모를 아래 폴더 목록 중 가장 적합한 하나에 분류해줘.',
    '폴더 경로만 출력해. 다른 설명 없이.',
    '',
    `메모: ${noteText.slice(0, 500)}`,
    '',
    '폴더 목록:',
    ...availablePaths,
  ].join('\n')

  try {
    const { stdout } = await execFileAsync('claude', ['-p', prompt])
    const raw = stdout.trim()
    const path = raw.split('/').map((s) => s.trim()).filter(Boolean)
    if (path.length === 0) return null
    return path
  } catch {
    return null
  }
}
