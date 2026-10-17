import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RequirementItem from '../components/RequirementItem.vue'
import type { Requirement } from '../types/requirement'

const requirement: Requirement = {
  id: 'requirement-1',
  title: '导出需求列表',
  description: '支持 CSV 导出',
  status: 'todo',
  createdAt: '2026-01-01T08:00:00.000Z',
  updatedAt: '2026-01-01T08:00:00.000Z',
}

describe('RequirementItem', () => {
  it('renders a delete button labelled with the requirement title', () => {
    const wrapper = mount(RequirementItem, {
      props: { requirement },
    })

    const button = wrapper.find('.delete-button')

    expect(button.exists()).toBe(true)
    expect(button.attributes('type')).toBe('button')
    expect(button.text()).toBe('删除')
    expect(button.attributes('aria-label')).toBe('删除需求：导出需求列表')
  })

  it('emits the requirement id when the delete button is clicked', async () => {
    const wrapper = mount(RequirementItem, {
      props: { requirement },
    })

    await wrapper.find('.delete-button').trigger('click')

    expect(wrapper.emitted('delete')).toEqual([['requirement-1']])
    expect(wrapper.emitted('update-status')).toBeUndefined()
  })
})
