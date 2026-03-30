import { classifyByClaude } from './claude-cli.js'
import { classifyByKeyword } from './keyword.js'
import type { Method, ClassificationResult, Note } from '../types.js'

export async function classifyNote(
  note: Note & { body: string },
  method: Method,
  engine: 'claude-cli' | 'keyword'
): Promise<ClassificationResult> {
  const text = `${note.title}\n${note.body}`
  const availablePaths = method.folders.map((f) => f.path.join('/'))

  let targetPath: string[] | null = null
  let usedEngine: 'claude-cli' | 'keyword' = engine

  if (engine === 'claude-cli') {
    targetPath = await classifyByClaude(text, availablePaths)
    if (!targetPath) {
      usedEngine = 'keyword'
      targetPath = classifyByKeyword(text, method)
    }
  } else {
    targetPath = classifyByKeyword(text, method)
  }

  if (!targetPath) {
    const lastFolder = method.folders[method.folders.length - 1]
    targetPath = lastFolder?.path ?? ['99_Archive']
    usedEngine = 'keyword'
  }

  return {
    noteId: note.id,
    noteTitle: note.title,
    targetPath,
    engine: usedEngine,
  }
}
