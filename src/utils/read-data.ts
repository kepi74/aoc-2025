import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export function readData({
  day,
  example = false,
}: {
  day: number
  example?: boolean
}): Array<string> {
  const filePath = resolve(
    import.meta.dirname,
    '../data',
    `day-${String(day).padStart(2, '0')}${example ? '.example' : ''}.txt`,
  )
  const fileContent = readFileSync(filePath, 'utf-8')
  return fileContent.split('\n').map((line) => line.trim())
}
