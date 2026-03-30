import * as clack from '@clack/prompts'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const execFileAsync = promisify(execFile)
const __dirname = dirname(fileURLToPath(import.meta.url))
const APP_DIR = resolve(__dirname, '../../')

export async function updateCommand(): Promise<void> {
  const spinner = clack.spinner()

  spinner.start('최신 버전 확인 중...')
  try {
    await execFileAsync('git', ['-C', APP_DIR, 'pull'])
    spinner.message('의존성 업데이트 중...')
    await execFileAsync('npm', ['install'], { cwd: APP_DIR })
    spinner.message('빌드 중...')
    await execFileAsync('npm', ['run', 'build'], { cwd: APP_DIR })
    spinner.stop('업데이트 완료 (설정 유지됨)')
  } catch (err) {
    spinner.stop('업데이트 실패')
    clack.log.error(String(err))
  }
}
