export const REQUIREMENT_STATUSES = ['todo', 'in-progress', 'done'] as const

export type RequirementStatus = (typeof REQUIREMENT_STATUSES)[number]

export type RequirementFilter = 'all' | RequirementStatus

export const STATUS_LABELS: Record<RequirementStatus, string> = {
  todo: '待处理',
  'in-progress': '进行中',
  done: '已完成',
}

export interface Requirement {
  id: string
  title: string
  description: string
  status: RequirementStatus
  createdAt: string
  updatedAt: string
}

export function isRequirementStatus(value: unknown): value is RequirementStatus {
  return REQUIREMENT_STATUSES.includes(value as RequirementStatus)
}
