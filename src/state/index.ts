import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { homedir } from 'os'
import yaml from 'js-yaml'
import type { Config, ProcessedState } from '../types.js'

const DEFAULT_ANO_DIR = join(homedir(), '.ano')

export function createStateManager(anoDir: string = DEFAULT_ANO_DIR) {
  const processedPath = join(anoDir, 'processed.json')
  const configPath = join(anoDir, 'config.yaml')

  async function ensureDir() {
    await mkdir(anoDir, { recursive: true })
  }

  async function getProcessedIds(): Promise<string[]> {
    try {
      const raw = await readFile(processedPath, 'utf-8')
      const state: ProcessedState = JSON.parse(raw)
      return state.processed_note_ids ?? []
    } catch {
      return []
    }
  }

  async function addProcessedIds(ids: string[]): Promise<void> {
    await ensureDir()
    const existing = await getProcessedIds()
    const merged = Array.from(new Set([...existing, ...ids]))
    const state: ProcessedState = {
      processed_note_ids: merged,
      last_run: new Date().toISOString(),
    }
    await writeFile(processedPath, JSON.stringify(state, null, 2), 'utf-8')
  }

  async function saveConfig(config: Config): Promise<void> {
    await ensureDir()
    await writeFile(configPath, yaml.dump(config), 'utf-8')
  }

  async function loadConfig(): Promise<Config | null> {
    try {
      const raw = await readFile(configPath, 'utf-8')
      return yaml.load(raw) as Config
    } catch {
      return null
    }
  }

  async function getLastRun(): Promise<string | null> {
    try {
      const raw = await readFile(processedPath, 'utf-8')
      const state: ProcessedState = JSON.parse(raw)
      return state.last_run ?? null
    } catch {
      return null
    }
  }

  return { getProcessedIds, addProcessedIds, saveConfig, loadConfig, getLastRun }
}

export type StateManager = ReturnType<typeof createStateManager>
