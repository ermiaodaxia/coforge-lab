import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  EMPTY_TITLE_ERROR,
  PERSISTENCE_ERROR,
  STORAGE_KEY,
  parseRequirements,
  useRequirements,
} from '../composables/useRequirements'
import type { Requirement } from '../types/requirement'

function storedRequirements(): Requirement[] {
  return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]') as Requirement[]
}

const validRequirement: Requirement = {
  id: 'requirement-1',
  title: '导出需求列表',
  description: '支持 CSV 导出',
  status: 'todo',
  createdAt: '2026-01-01T08:00:00.000Z',
  updatedAt: '2026-01-01T08:00:00.000Z',
}

beforeEach(() => {
  window.localStorage.clear()
  vi.useRealTimers()
})

describe('parseRequirements', () => {
  it('returns an empty list for missing or empty values', () => {
    expect(parseRequirements(null)).toEqual([])
    expect(parseRequirements('')).toEqual([])
  })

  it('returns an empty list for malformed JSON', () => {
    expect(parseRequirements('{not-json')).toEqual([])
  })

  it('returns an empty list when the stored value is not an array', () => {
    expect(parseRequirements(JSON.stringify({ title: 'hello' }))).toEqual([])
  })

  it('filters out invalid records while keeping valid ones', () => {
    const parsed = parseRequirements(
      JSON.stringify([
        validRequirement,
        { ...validRequirement, id: '' },
        { ...validRequirement, title: '   ' },
        { ...validRequirement, status: 'unknown' },
        { ...validRequirement, createdAt: 'not-a-date' },
        null,
      ]),
    )

    expect(parsed).toEqual([validRequirement])
  })

  it('trims stored title and description values', () => {
    const parsed = parseRequirements(
      JSON.stringify([{ ...validRequirement, title: '  标题  ', description: '  描述  ' }]),
    )

    expect(parsed[0].title).toBe('标题')
    expect(parsed[0].description).toBe('描述')
  })
})

describe('useRequirements', () => {
  it('starts with an empty list when storage has no data', () => {
    const { requirements } = useRequirements()

    expect(requirements.value).toEqual([])
  })

  it('loads stored requirements on creation', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([validRequirement]))

    const { requirements } = useRequirements()

    expect(requirements.value).toEqual([validRequirement])
  })

  it('adds a requirement with trimmed values and persists it', () => {
    const { requirements, addRequirement } = useRequirements()

    const result = addRequirement('  新需求  ', '  补充说明  ')

    expect(result).toEqual({ ok: true })
    expect(requirements.value).toHaveLength(1)
    expect(requirements.value[0]).toMatchObject({
      title: '新需求',
      description: '补充说明',
      status: 'todo',
    })
    expect(storedRequirements()[0]).toMatchObject({
      title: '新需求',
      description: '补充说明',
      status: 'todo',
    })
  })

  it('places newly added requirements at the top of the list', () => {
    const { requirements, addRequirement } = useRequirements()

    addRequirement('第一条')
    addRequirement('第二条')

    expect(requirements.value.map((requirement) => requirement.title)).toEqual([
      '第二条',
      '第一条',
    ])
  })

  it('rejects a blank title without changing the list or storage', () => {
    const { requirements, addRequirement } = useRequirements()

    const result = addRequirement('   ')

    expect(result).toEqual({ ok: false, error: EMPTY_TITLE_ERROR })
    expect(requirements.value).toEqual([])
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('allows an empty description', () => {
    const { requirements, addRequirement } = useRequirements()

    addRequirement('只有标题')

    expect(requirements.value[0].description).toBe('')
  })

  it('updates status and refresh timestamp', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))
    const { requirements, addRequirement, updateStatus } = useRequirements()
    addRequirement('状态测试')

    const id = requirements.value[0].id
    vi.setSystemTime(new Date('2026-01-02T00:00:00.000Z'))
    const updated = updateStatus(id, 'done')

    expect(updated).toBe(true)
    expect(requirements.value[0].status).toBe('done')
    expect(requirements.value[0].updatedAt).toBe('2026-01-02T00:00:00.000Z')
    expect(storedRequirements()[0].status).toBe('done')
  })

  it('returns false when updating an unknown requirement', () => {
    const { updateStatus } = useRequirements()

    expect(updateStatus('missing', 'done')).toBe(false)
  })

  it('reports a persistence error when storage writes fail', () => {
    const failingStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('quota exceeded')
      },
    } as unknown as Storage
    const { persistenceError, addRequirement } = useRequirements(failingStorage)

    addRequirement('无法持久化的需求')

    expect(persistenceError.value).toBe(PERSISTENCE_ERROR)
  })
})
