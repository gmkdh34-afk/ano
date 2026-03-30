import { readFile, readdir } from 'fs/promises'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import yaml from 'js-yaml'
import type { Method } from '../types.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const DEFAULT_METHODS_DIR = resolve(__dirname, '../../methods')

export async function loadMethod(id: string, methodsDir = DEFAULT_METHODS_DIR): Promise<Method> {
  const filePath = join(methodsDir, `${id}.yaml`)
  try {
    const raw = await readFile(filePath, 'utf-8')
    return yaml.load(raw) as Method
  } catch {
    throw new Error(`정리 방식 '${id}'를 찾을 수 없습니다: ${filePath}`)
  }
}

export async function listMethods(methodsDir = DEFAULT_METHODS_DIR): Promise<Method[]> {
  const files = await readdir(methodsDir)
  const yamlFiles = files.filter((f) => f.endsWith('.yaml') && f !== 'template.yaml')
  const methods = await Promise.all(
    yamlFiles.map(async (f) => {
      const raw = await readFile(join(methodsDir, f), 'utf-8')
      return yaml.load(raw) as Method
    })
  )
  return methods
}
