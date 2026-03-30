import { execFile } from 'child_process'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import type { Note } from '../types.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SCRIPTS_DIR = resolve(__dirname, '../../scripts')

function execFileAsync(cmd: string, args: string[]): Promise<{ stdout: string }> {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, (err, stdout, stderr) => {
      if (err) {
        reject(err)
      } else {
        resolve({ stdout })
      }
    })
  })
}

async function runScript(scriptName: string, args: string[] = []): Promise<string> {
  const scriptPath = resolve(SCRIPTS_DIR, scriptName)
  try {
    const { stdout } = await execFileAsync('osascript', [scriptPath, ...args])
    return stdout.trim()
  } catch (err) {
    return ''
  }
}

export async function getNoteIds(): Promise<Note[]> {
  const output = await runScript('read_note_ids.applescript')
  if (!output) return []
  return output
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [id, title, folder] = line.split('|||')
      return { id: id.trim(), title: title.trim(), folder: folder.trim() }
    })
}

export async function getNoteBody(noteId: string): Promise<string> {
  return runScript('read_note_body.applescript', [noteId])
}

export async function getNotesBatch(offset: number, limit: number): Promise<Note[]> {
  const output = await runScript('read_notes_batch.applescript', [
    String(offset),
    String(limit),
  ])
  if (!output) return []
  const lines = output.split('\n').filter(Boolean)
  const dataLines = lines.filter((l) => !l.startsWith('TOTAL:'))
  return dataLines.map((line) => {
    const [id, title, folder, ...bodyParts] = line.split('|||')
    return {
      id: id.trim(),
      title: title.trim(),
      folder: folder.trim(),
      body: bodyParts.join('|||').trim(),
    }
  })
}

export async function getTotalNoteCount(): Promise<number> {
  const output = await runScript('read_notes_batch.applescript', ['0', '1'])
  const firstLine = output.split('\n')[0] ?? ''
  const match = firstLine.match(/^TOTAL:(\d+)/)
  return match ? parseInt(match[1], 10) : 0
}

export async function moveNote(noteId: string, folderPath: string[]): Promise<boolean> {
  try {
    await execFileAsync('osascript', [
      resolve(SCRIPTS_DIR, 'move_note.applescript'),
      noteId,
      ...folderPath,
    ])
    return true
  } catch {
    return false
  }
}

export async function createFolder(folderPath: string[]): Promise<boolean> {
  try {
    await execFileAsync('osascript', [
      resolve(SCRIPTS_DIR, 'create_folder.applescript'),
      ...folderPath,
    ])
    return true
  } catch {
    return false
  }
}
