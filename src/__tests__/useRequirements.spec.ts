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

  it('removes the matching requirement and persists the change', () => {
    const { requirements, addRequirement, removeRequirement } = useRequirements()
    addRequirement('第一条')
    addRequirement('第二条')

    const removed = removeRequirement(requirements.value[0].id)

    expect(removed).toBe(true)
    expect(requirements.value.map((requirement) => requirement.title)).toEqual([
      '第一条',
    ])
    expect(storedRequirements().map((requirement) => requirement.title)).toEqual([
      '第一条',
    ])
  })

  it('removes only the specified requirement', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        validRequirement,
        { ...validRequirement, id: 'requirement-2', title: '保留的需求' },
      ]),
    )
    const { requirements, removeRequirement } = useRequirements()

    removeRequirement('requirement-1')

    expect(requirements.value.map((requirement) => requirement.id)).toEqual([
      'requirement-2',
    ])
    expect(storedRequirements().map((requirement) => requirement.id)).toEqual([
      'requirement-2',
    ])
  })

  it('persists an empty list when removing the last requirement', () => {
    const { requirements, addRequirement, removeRequirement } = useRequirements()
    addRequirement('唯一的需求')

    removeRequirement(requirements.value[0].id)

    expect(requirements.value).toEqual([])
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('[]')
  })

  it('returns false and leaves storage untouched for an unknown id', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([validRequirement]))
    const { requirements, removeRequirement } = useRequirements()
    const storedBefore = window.localStorage.getItem(STORAGE_KEY)

    const removed = removeRequirement('missing')

    expect(removed).toBe(false)
    expect(requirements.value).toEqual([validRequirement])
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(storedBefore)
  })

  it('does not restore a removed requirement after reloading', () => {
    const first = useRequirements()
    first.addRequirement('会被删除')
    first.addRequirement('会被保留')
    const removedId = first.requirements.value.find(
      (requirement) => requirement.title === '会被删除',
    )!.id
    first.removeRequirement(removedId)

    const second = useRequirements()

    expect(second.requirements.value.map((requirement) => requirement.title)).toEqual([
      '会被保留',
    ])
  })

  it('reports a persistence error when removal cannot be persisted', () => {
    const failingStorage = {
      getItem: () => JSON.stringify([validRequirement]),
      setItem: () => {
        throw new Error('quota exceeded')
      },
    } as unknown as Storage
    const { requirements, persistenceError, removeRequirement } =
      useRequirements(failingStorage)

    const removed = removeRequirement(validRequirement.id)

    expect(removed).toBe(true)
    expect(requirements.value).toEqual([])
    expect(persistenceError.value).toBe(PERSISTENCE_ERROR)
  })
})
