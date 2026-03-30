import * as clack from '@clack/prompts'
import { listMethods } from '../methods/index.js'
import type { Method } from '../types.js'

export async function pickMethod(): Promise<Method> {
  const methods = await listMethods()
  const choices = methods.map((m) => ({
    value: m.id,
    label: m.name,
    hint: m.description,
  }))

  const selected = await clack.select({
    message: '노트 정리 방식을 선택하세요',
    options: choices,
  })

  if (clack.isCancel(selected)) {
    clack.cancel('취소됨')
    process.exit(0)
  }

  return methods.find((m) => m.id === selected)!
}
