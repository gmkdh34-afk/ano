#!/usr/bin/env node
import { Command } from 'commander'
import { setupCommand } from './commands/setup.js'
import { runCommand } from './commands/run.js'
import { scheduleCommand, unscheduleCommand } from './commands/schedule.js'
import { statusCommand } from './commands/status.js'
import { reconfigureCommand } from './commands/reconfigure.js'
import { updateCommand } from './commands/update.js'

const program = new Command()

program
  .name('ano')
  .description('Apple Notes Organizer — iPhone 메모 자동 정리')
  .version('1.0.0')

program
  .command('setup')
  .description('처음 한 번 실행. 정리 방식 선택 및 폴더 생성')
  .action(setupCommand)

program
  .command('run')
  .description('미분류 메모를 읽어서 분류 후 이동')
  .option('--dry-run', '실제 이동 없이 미리보기', false)
  .option('--batch-size <n>', '배치 크기 (기본: 50)', '50')
  .option('--verbose', '상세 로그 출력', false)
  .action((opts) =>
    runCommand({
      dryRun: opts.dryRun,
      batchSize: parseInt(opts.batchSize, 10),
      verbose: opts.verbose,
    })
  )

program
  .command('schedule')
  .description('자동 실행 스케줄 등록 (macOS launchd)')
  .action(scheduleCommand)

program
  .command('unschedule')
  .description('자동 실행 스케줄 해제')
  .action(unscheduleCommand)

program
  .command('status')
  .description('현재 설정 및 처리 현황 확인')
  .action(statusCommand)

program
  .command('reconfigure')
  .description('설정 변경 (방식 교체, AI 엔진 변경, 초기화)')
  .action(reconfigureCommand)

program
  .command('update')
  .description('최신 버전으로 업데이트 (설정 유지)')
  .action(updateCommand)

program.parse()
