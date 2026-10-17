import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RequirementList from '../components/RequirementList.vue'
import type { Requirement } from '../types/requirement'

const requirements: Requirement[] = [
  {
    id: 'requirement-1',
    title: '导出需求列表',
    description: '支持 CSV 导出',
    status: 'todo',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'requirement-2',
    title: '按状态筛选',
    description: '',
    status: 'done',
    createdAt: '2026-01-02T08:00:00.000Z',
    updatedAt: '2026-01-02T08:00:00.000Z',
  },
]

describe('RequirementList', () => {
  it('shows an empty state when there are no requirements', () => {
    const wrapper = mount(RequirementList, {
      props: { requirements: [] },
    })

    expect(wrapper.text()).toContain('暂无需求')
    expect(wrapper.findAll('li')).toHaveLength(0)
  })

  it('renders requirements with descriptions and status labels', () => {
    const wrapper = mount(RequirementList, {
      props: { requirements },
    })

    expect(wrapper.findAll('h3').map((heading) => heading.text())).toEqual([
      '导出需求列表',
      '按状态筛选',
    ])
    expect(wrapper.text()).toContain('支持 CSV 导出')
    expect(wrapper.findAll('select')[0].element.value).toBe('todo')
    expect(wrapper.findAll('select')[1].element.value).toBe('done')
    expect(wrapper.findAll('option').map((option) => option.text())).toContain('进行中')
  })

  it('emits the requirement id and new status when a status is selected', async () => {
    const wrapper = mount(RequirementList, {
      props: { requirements },
    })

    await wrapper.findAll('select')[0].setValue('in-progress')

    expect(wrapper.emitted('update-status')).toEqual([
      ['requirement-1', 'in-progress'],
    ])
  })

  it('shows the requirement count', () => {
    const wrapper = mount(RequirementList, {
      props: { requirements },
    })

    expect(wrapper.text()).toContain('2 条')
  })
})
