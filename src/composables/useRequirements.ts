import { ref } from 'vue'
import {
  isRequirementStatus,
  type Requirement,
  type RequirementStatus,
} from '../types/requirement'

export const STORAGE_KEY = 'coforge-lab.requirements.v1'
export const EMPTY_TITLE_ERROR = '请输入需求标题'
export const PERSISTENCE_ERROR = '需求已更新，但浏览器本地存储不可用，刷新后可能丢失。'

export interface AddRequirementResult {
  ok: boolean
  error?: string
}

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function toRequirement(value: unknown): Requirement | null {
  if (typeof value !== 'object' || value === null) {
    return null
  }

  const record = value as Record<string, unknown>
  const title = typeof record.title === 'string' ? record.title.trim() : ''
  const id = typeof record.id === 'string' ? record.id.trim() : ''
  const createdAt = typeof record.createdAt === 'string' ? record.createdAt : ''
  const updatedAt = typeof record.updatedAt === 'string' ? record.updatedAt : ''

  if (
    !id ||
    !title ||
    !isRequirementStatus(record.status) ||
    Number.isNaN(Date.parse(createdAt)) ||
    Number.isNaN(Date.parse(updatedAt))
  ) {
    return null
  }

  return {
    id,
    title,
    description:
      typeof record.description === 'string' ? record.description.trim() : '',
    status: record.status,
    createdAt,
    updatedAt,
  }
}

export function parseRequirements(raw: string | null): Requirement[] {
  if (!raw) {
    return []
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed
      .map(toRequirement)
      .filter((requirement): requirement is Requirement => requirement !== null)
  } catch {
    return []
  }
}

export function useRequirements(storage: Storage = window.localStorage) {
  const requirements = ref<Requirement[]>(parseRequirements(storage.getItem(STORAGE_KEY)))
  const persistenceError = ref<string | null>(null)

  function persist(): void {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(requirements.value))
      persistenceError.value = null
    } catch {
      persistenceError.value = PERSISTENCE_ERROR
    }
  }

  function addRequirement(title: string, description = ''): AddRequirementResult {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      return { ok: false, error: EMPTY_TITLE_ERROR }
    }

    const now = new Date().toISOString()
    const requirement: Requirement = {
      id: createId(),
      title: trimmedTitle,
      description: description.trim(),
      status: 'todo',
      createdAt: now,
      updatedAt: now,
    }

    requirements.value = [requirement, ...requirements.value]
    persist()
    return { ok: true }
  }

  function updateStatus(id: string, status: RequirementStatus): boolean {
    if (!isRequirementStatus(status)) {
      return false
    }

    const index = requirements.value.findIndex((requirement) => requirement.id === id)
    if (index === -1) {
      return false
    }

    if (requirements.value[index].status !== status) {
      requirements.value = requirements.value.map((requirement, currentIndex) =>
        currentIndex === index
          ? { ...requirement, status, updatedAt: new Date().toISOString() }
          : requirement,
      )
      persist()
    }

    return true
  }

  function removeRequirement(id: string): boolean {
    const index = requirements.value.findIndex((requirement) => requirement.id === id)
    if (index === -1) {
      return false
    }

    requirements.value = requirements.value.filter(
      (requirement) => requirement.id !== id,
    )
    persist()
    return true
  }

  return {
    requirements,
    persistenceError,
    addRequirement,
    updateStatus,
    removeRequirement,
  }
}
