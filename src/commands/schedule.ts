import { setupSchedule, removeSchedule } from '../scheduler/index.js'

export async function scheduleCommand(): Promise<void> {
  await setupSchedule()
}

export async function unscheduleCommand(): Promise<void> {
  await removeSchedule()
}
