export interface Note {
  id: string
  title: string
  folder: string
  body?: string
}

export interface Folder {
  path: string[]       // ['00_Personal', '02_Study', '01_AI']
  keywords: string[]
}

export interface Method {
  id: string
  name: string
  description: string
  type: 'hierarchical' | 'fixed' | 'custom'
  folders: Folder[]
}

export interface Config {
  method: string
  ai_engine: 'claude-cli' | 'keyword'
  created_at: string
}

export interface ProcessedState {
  processed_note_ids: string[]
  last_run: string
}

export interface ClassificationResult {
  noteId: string
  noteTitle: string
  targetPath: string[]
  engine: 'claude-cli' | 'keyword'
}

export interface RunResult {
  total: number
  succeeded: number
  failed: number
  skipped: number
  durationMs: number
  results: ClassificationResult[]
}
