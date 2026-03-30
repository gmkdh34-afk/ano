import * as clack from '@clack/prompts'
import type { Method, Folder } from '../types.js'

async function build5Level(): Promise<Folder[]> {
  const areas = await clack.text({
    message: '주요 영역을 입력하세요',
    placeholder: '예: 개인, 업무, 공부',
    validate: (v) => (!v ? '최소 1개 이상 입력해주세요' : undefined),
  })
  if (clack.isCancel(areas)) { clack.cancel('취소됨'); process.exit(0) }

  const areaList = String(areas).split(',').map((s) => s.trim()).filter(Boolean)
  const folders: Folder[] = []
  let areaIndex = 1

  for (const area of areaList) {
    const prefix = `0${areaIndex}_`
    const areaName = `${prefix}${area}`

    const subInput = await clack.text({
      message: `'${area}' 아래 세부 주제는? (없으면 Enter 스킵)`,
      placeholder: '예: 일정, AI, 투자',
    })
    if (clack.isCancel(subInput)) { clack.cancel('취소됨'); process.exit(0) }

    const subs = String(subInput || '').split(',').map((s) => s.trim()).filter(Boolean)

    if (subs.length === 0) {
      folders.push({ path: [areaName], keywords: [] })
    } else {
      let subIndex = 1
      for (const sub of subs) {
        folders.push({ path: [areaName, `0${subIndex}_${sub}`], keywords: [] })
        subIndex++
      }
    }
    areaIndex++
  }

  folders.push({ path: ['99_Archive'], keywords: [] })
  return folders
}

async function buildPARA(): Promise<Folder[]> {
  const folders: Folder[] = []

  const projects = await clack.text({
    message: '현재 진행 중인 프로젝트는? (마감 있는 것만)',
    placeholder: '예: 앱 런칭, SNS 채널 성장',
  })
  if (clack.isCancel(projects)) { clack.cancel('취소됨'); process.exit(0) }
  String(projects || '').split(',').filter(Boolean).forEach((p) => {
    folders.push({ path: ['Projects', p.trim()], keywords: [] })
  })

  const areas = await clack.text({
    message: '지속 관리할 삶의 영역은?',
    placeholder: '예: 건강, 재정, 비즈니스',
  })
  if (clack.isCancel(areas)) { clack.cancel('취소됨'); process.exit(0) }
  String(areas || '').split(',').filter(Boolean).forEach((a) => {
    folders.push({ path: ['Areas', a.trim()], keywords: [] })
  })

  const resources = await clack.text({
    message: '모아두는 관심 주제는?',
    placeholder: '예: AI, 마케팅, 투자',
  })
  if (clack.isCancel(resources)) { clack.cancel('취소됨'); process.exit(0) }
  String(resources || '').split(',').filter(Boolean).forEach((r) => {
    folders.push({ path: ['Resources', r.trim()], keywords: [] })
  })

  folders.push({ path: ['Archive'], keywords: [] })
  return folders
}

async function buildZettelkasten(): Promise<Folder[]> {
  const mocs = await clack.text({
    message: 'MOC(목차 메모)로 만들 주제를 입력하세요',
    placeholder: '예: AI, 투자, 마케팅',
  })
  if (clack.isCancel(mocs)) { clack.cancel('취소됨'); process.exit(0) }

  const folders: Folder[] = [
    { path: ['Fleeting Notes'], keywords: [] },
    { path: ['Literature Notes'], keywords: [] },
    { path: ['Permanent Notes'], keywords: [] },
  ]
  String(mocs || '').split(',').filter(Boolean).forEach((m) => {
    folders.push({ path: ['Maps of Content', `MOC-${m.trim()}`], keywords: [] })
  })
  return folders
}

async function buildJohnnyDecimal(): Promise<Folder[]> {
  const areasInput = await clack.text({
    message: '삶의 영역을 최대 10개 이하로 입력하세요',
    placeholder: '예: Tech, Finance, Business, Personal',
    validate: (v) => (!v ? '최소 1개 이상 입력하세요' : undefined),
  })
  if (clack.isCancel(areasInput)) { clack.cancel('취소됨'); process.exit(0) }

  const areas = String(areasInput).split(',').map((s) => s.trim()).filter(Boolean).slice(0, 10)
  const folders: Folder[] = []

  for (let i = 0; i < areas.length; i++) {
    const rangeStart = (i + 1) * 10
    const rangeEnd = rangeStart + 9
    const areaName = `${rangeStart}-${rangeEnd} ${areas[i]}`

    const catsInput = await clack.text({
      message: `'${areas[i]}' (${rangeStart}-${rangeEnd}) 안의 세부 분류는?`,
      placeholder: '예: AI Tools, 개발 지식',
    })
    if (clack.isCancel(catsInput)) { clack.cancel('취소됨'); process.exit(0) }

    String(catsInput || '').split(',').filter(Boolean).forEach((cat, j) => {
      const catNum = rangeStart + j + 1
      folders.push({ path: [areaName, `${catNum} ${cat.trim()}`], keywords: [] })
    })
  }
  return folders
}

async function buildCustom(): Promise<Folder[]> {
  clack.log.info('대화를 통해 폴더 구조를 만들어드립니다.')
  return build5Level()
}

export async function buildFolders(method: Method): Promise<Folder[]> {
  switch (method.id) {
    case '5level': return build5Level()
    case 'para': return buildPARA()
    case 'zettelkasten': return buildZettelkasten()
    case 'johnny-decimal': return buildJohnnyDecimal()
    default: return buildCustom()
  }
}

export function renderFolderTree(folders: { path: string[] }[]): string {
  return folders.map((f) => '  ' + f.path.join(' / ')).join('\n')
}
