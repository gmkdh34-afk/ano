import { writeFile, unlink, readFile } from 'fs/promises'
import { join } from 'path'
import { homedir } from 'os'
import { execFile } from 'child_process'
import { promisify } from 'util'
import * as clack from '@clack/prompts'

const execFileAsync = promisify(execFile)
const PLIST_NAME = 'com.ano.run.plist'
const LAUNCH_AGENTS_DIR = join(homedir(), 'Library', 'LaunchAgents')
const PLIST_PATH = join(LAUNCH_AGENTS_DIR, PLIST_NAME)

interface PlistOptions {
  hour: number
  minute: number
  scriptPath: string
}

export function generatePlist(opts: PlistOptions): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.ano.run</string>
  <key>ProgramArguments</key>
  <array>
    <string>${opts.scriptPath}</string>
    <string>run</string>
  </array>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key>
    <integer>${opts.hour}</integer>
    <key>Minute</key>
    <integer>${opts.minute}</integer>
  </dict>
  <key>StandardOutPath</key>
  <string>${homedir()}/.ano/run.log</string>
  <key>StandardErrorPath</key>
  <string>${homedir()}/.ano/run.error.log</string>
</dict>
</plist>`
}

export async function setupSchedule(): Promise<void> {
  const timeChoice = await clack.select({
    message: '자동 실행 시간을 선택하세요',
    options: [
      { value: '9:0', label: '매일 오전 9시' },
      { value: '18:0', label: '매일 오후 6시' },
      { value: 'custom', label: '직접 입력' },
    ],
  })
  if (clack.isCancel(timeChoice)) return

  let hour = 9
  let minute = 0

  if (timeChoice === 'custom') {
    const input = await clack.text({
      message: '시간을 입력하세요 (HH:MM 형식)',
      placeholder: '09:00',
      validate: (v) => {
        const [h, m] = v.split(':').map(Number)
        if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
          return '올바른 시간 형식을 입력하세요 (예: 09:00)'
        }
      },
    })
    if (clack.isCancel(input)) return
    const [h, m] = String(input).split(':').map(Number)
    hour = h
    minute = m
  } else {
    const [h, m] = String(timeChoice).split(':').map(Number)
    hour = h
    minute = m
  }

  const anoPath = process.argv[1] ?? 'ano'
  const plist = generatePlist({ hour, minute, scriptPath: anoPath })
  await writeFile(PLIST_PATH, plist, 'utf-8')
  await execFileAsync('launchctl', ['load', PLIST_PATH])

  clack.log.success(`매일 ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} 자동 실행 등록됨`)
}

export async function removeSchedule(): Promise<void> {
  try {
    await execFileAsync('launchctl', ['unload', PLIST_PATH])
    await unlink(PLIST_PATH)
    clack.log.success('자동 실행 해제됨')
  } catch {
    clack.log.warn('등록된 스케줄이 없습니다')
  }
}

export async function getScheduleStatus(): Promise<{ active: boolean; time?: string }> {
  try {
    const content = await readFile(PLIST_PATH, 'utf-8')
    const hourMatch = content.match(/<key>Hour<\/key>\s*<integer>(\d+)<\/integer>/)
    const minMatch = content.match(/<key>Minute<\/key>\s*<integer>(\d+)<\/integer>/)
    if (hourMatch && minMatch) {
      const h = hourMatch[1].padStart(2, '0')
      const m = minMatch[1].padStart(2, '0')
      return { active: true, time: `${h}:${m}` }
    }
    return { active: true }
  } catch {
    return { active: false }
  }
}
