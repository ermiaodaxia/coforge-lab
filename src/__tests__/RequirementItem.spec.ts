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

const PREVIEW_LENGTH = 80

function createRequirement(overrides: Partial<Requirement> = {}): Requirement {
  return {
    id: 'requirement-1',
    title: '测试需求',
    description: '',
    status: 'todo',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
    ...overrides,
  }
}

function mountItem(requirement: Requirement) {
  return mount(RequirementItem, { props: { requirement } })
}

describe('RequirementItem description collapse', () => {
  it('does not render a description block when the description is empty', () => {
    const wrapper = mountItem(createRequirement({ description: '' }))

    expect(wrapper.find('.requirement-description').exists()).toBe(false)
    expect(wrapper.find('.description-toggle').exists()).toBe(false)
  })

  it('shows a short description in full without a toggle', () => {
    const wrapper = mountItem(createRequirement({ description: '支持 CSV 导出' }))

    expect(wrapper.find('.requirement-description').text()).toBe('支持 CSV 导出')
    expect(wrapper.find('.description-toggle').exists()).toBe(false)
  })

  it('shows exactly 80 characters in full without a toggle', () => {
    const description = '需'.repeat(PREVIEW_LENGTH)
    const wrapper = mountItem(createRequirement({ description }))

    expect(wrapper.find('.requirement-description').text()).toBe(description)
    expect(wrapper.find('.description-toggle').exists()).toBe(false)
  })

  it('truncates 81 characters to the first 80 plus an ellipsis', () => {
    const description = '需'.repeat(PREVIEW_LENGTH + 1)
    const wrapper = mountItem(createRequirement({ description }))

    expect(wrapper.find('.requirement-description').text()).toBe(
      `${'需'.repeat(PREVIEW_LENGTH)}…`,
    )
    expect(wrapper.find('.description-toggle').text()).toBe('展开')
    expect(wrapper.find('.description-toggle').attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('.description-toggle').attributes('aria-controls')).toBe(
      'description-requirement-1',
    )
  })

  it('expands to the full description and collapses back', async () => {
    const description = `${'甲'.repeat(PREVIEW_LENGTH)}完整结尾`
    const wrapper = mountItem(createRequirement({ description }))
    const toggle = wrapper.find('.description-toggle')

    await toggle.trigger('click')

    expect(toggle.text()).toBe('收起')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('.requirement-description').text()).toBe(description)

    await toggle.trigger('click')

    expect(toggle.text()).toBe('展开')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('.requirement-description').text()).toBe(
      `${'甲'.repeat(PREVIEW_LENGTH)}…`,
    )
  })

  it('counts emoji as a single character at the boundary', () => {
    const description = `${'需'.repeat(PREVIEW_LENGTH - 1)}😀`
    const wrapper = mountItem(createRequirement({ description }))

    expect(wrapper.find('.requirement-description').text()).toBe(description)
    expect(wrapper.find('.description-toggle').exists()).toBe(false)
  })

  it('does not split emoji when truncating past the boundary', () => {
    const description = `${'需'.repeat(PREVIEW_LENGTH - 1)}😀尾`
    const wrapper = mountItem(createRequirement({ description }))
    const preview = wrapper.find('.requirement-description').text()

    expect(preview).toBe(`${'需'.repeat(PREVIEW_LENGTH - 1)}😀…`)
    expect(preview).not.toContain('\uFFFD')
    expect(preview).not.toContain('尾')
    expect(wrapper.find('.description-toggle').exists()).toBe(true)
  })

  it('still emits status changes', async () => {
    const wrapper = mountItem(createRequirement())

    await wrapper.find('select').setValue('in-progress')

    expect(wrapper.emitted('update-status')).toEqual([
      ['requirement-1', 'in-progress'],
    ])
  })
})
