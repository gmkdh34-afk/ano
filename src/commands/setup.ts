import { runSetup } from '../wizard/setup.js'

export async function setupCommand(): Promise<void> {
  await runSetup()
}
