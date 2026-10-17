import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RequirementForm from '../components/RequirementForm.vue'

describe('RequirementForm', () => {
  it('shows an error and does not submit when the title is blank', async () => {
    const wrapper = mount(RequirementForm)

    await wrapper.find('input').setValue('   ')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.find('[role="alert"]').text()).toContain('请输入需求标题')
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('clears the error when the user types again', async () => {
    const wrapper = mount(RequirementForm)
    await wrapper.find('form').trigger('submit')
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)

    await wrapper.find('input').setValue('新需求')

    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('emits trimmed values and clears the form after a valid submit', async () => {
    const wrapper = mount(RequirementForm)

    await wrapper.find('input').setValue('  新需求  ')
    await wrapper.find('textarea').setValue('  需求描述  ')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toEqual([
      [{ title: '新需求', description: '需求描述' }],
    ])
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('')
    expect((wrapper.find('textarea').element as HTMLTextAreaElement).value).toBe('')
  })

  it('allows submitting with an empty description', async () => {
    const wrapper = mount(RequirementForm)

    await wrapper.find('input').setValue('只有标题')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toEqual([
      [{ title: '只有标题', description: '' }],
    ])
  })
})
