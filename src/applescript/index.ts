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
  const { stdout } = await execFileAsync('osascript', [scriptPath, ...args])
  return stdout.trim()
}

export async function getNoteIds(): Promise<Note[]> {
  try {
    const output = await runScript('read_note_ids.applescript')
    if (!output) return []
    return output
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const [id, title, folder] = line.split('|||')
        return { id: id.trim(), title: title.trim(), folder: folder.trim() }
      })
  } catch (err) {
    throw new Error(`Apple Notes 스캔 실패: ${err instanceof Error ? err.message : err}`)
  }
}

export async function getNoteBody(noteId: string): Promise<string> {
  try {
    return await runScript('read_note_body.applescript', [noteId])
  } catch {
    return ''
  }
}

export async function getNotesBatch(offset: number, limit: number): Promise<Note[]> {
  try {
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
  } catch (err) {
    throw new Error(`배치 읽기 실패 (offset=${offset}): ${err instanceof Error ? err.message : err}`)
  }
}

export async function getTotalNoteCount(): Promise<number> {
  try {
    const output = await runScript('read_notes_batch.applescript', ['0', '1'])
    const firstLine = output.split('\n')[0] ?? ''
    const match = firstLine.match(/^TOTAL:(\d+)/)
    return match ? parseInt(match[1], 10) : 0
  } catch (err) {
    throw new Error(`메모 수 확인 실패: ${err instanceof Error ? err.message : err}`)
  }
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
