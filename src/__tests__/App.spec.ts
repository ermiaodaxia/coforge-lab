import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import App from '../App.vue'
import { STORAGE_KEY } from '../composables/useRequirements'

describe('App', () => {
  it('adds a requirement and restores it after remounting', async () => {
    const firstMount = mount(App)

    await firstMount.find('#requirement-title').setValue('刷新后仍存在')
    await firstMount.find('#requirement-description').setValue('来自本地存储')
    await firstMount.find('form').trigger('submit')

    expect(firstMount.findAll('h3').map((heading) => heading.text())).toContain(
      '刷新后仍存在',
    )
    expect(window.localStorage.getItem(STORAGE_KEY)).toContain('刷新后仍存在')
    firstMount.unmount()

    const secondMount = mount(App)

    expect(secondMount.findAll('h3').map((heading) => heading.text())).toContain(
      '刷新后仍存在',
    )
    expect(secondMount.text()).toContain('来自本地存储')
  })

  it('persists status changes', async () => {
    const wrapper = mount(App)
    await wrapper.find('#requirement-title').setValue('状态持久化')
    await wrapper.find('form').trigger('submit')

    await wrapper.find('.requirement-item select').setValue('done')

    expect(
      (wrapper.find('.requirement-item select').element as HTMLSelectElement).value,
    ).toBe('done')
    expect(window.localStorage.getItem(STORAGE_KEY)).toContain('"status":"done"')
  })

  it('filters requirements by status', async () => {
    const wrapper = mount(App)

    await wrapper.find('#requirement-title').setValue('待处理需求')
    await wrapper.find('form').trigger('submit')
    await wrapper.find('#requirement-title').setValue('将完成的需求')
    await wrapper.find('form').trigger('submit')

    await wrapper.findAll('.requirement-item select')[0].setValue('done')

    await wrapper.find('#status-filter').setValue('done')
    expect(wrapper.findAll('h3').map((heading) => heading.text())).toEqual([
      '将完成的需求',
    ])
    expect(wrapper.text()).toContain('1 / 2 条')

    await wrapper.find('#status-filter').setValue('todo')
    expect(wrapper.findAll('h3').map((heading) => heading.text())).toEqual([
      '待处理需求',
    ])

    await wrapper.find('#status-filter').setValue('all')
    expect(wrapper.findAll('h3').map((heading) => heading.text())).toEqual([
      '将完成的需求',
      '待处理需求',
    ])
    expect(wrapper.text()).toContain('2 条')
  })
})
