export interface Member {
  id: string
  name: string
}

/**
 * 内置示例成员：第一版没有用户体系，先固定几位成员用于演示处理人分配。
 * id 会写入本地存储，请勿随意修改。
 */
export const MEMBERS: readonly Member[] = [
  { id: 'member-1', name: '陈一鸣' },
  { id: 'member-2', name: '林小雨' },
  { id: 'member-3', name: '周子墨' },
  { id: 'member-4', name: '苏晴' },
  { id: 'member-5', name: '何嘉禾' },
]

export function findMember(id: string): Member | undefined {
  return MEMBERS.find((member) => member.id === id)
}
