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

    expect(wrapper.text()).toContain('全部 2、待处理 2、进行中 0、已完成 0')

    await wrapper.findAll('.requirement-item select')[0].setValue('done')

    expect(wrapper.text()).toContain('全部 2、待处理 1、进行中 0、已完成 1')

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

  it('filters by title search without touching persisted data', async () => {
    const wrapper = mount(App)

    await wrapper.find('#requirement-title').setValue('导出标题测试')
    await wrapper.find('form').trigger('submit')
    await wrapper.find('#requirement-title').setValue('导入标题测试')
    await wrapper.find('form').trigger('submit')

    const storedBeforeSearch = window.localStorage.getItem(STORAGE_KEY)

    await wrapper.find('#title-search').setValue('导出')

    expect(wrapper.findAll('h3').map((heading) => heading.text())).toEqual([
      '导出标题测试',
    ])
    expect(wrapper.text()).toContain('1 / 2 条')
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(storedBeforeSearch)

    await wrapper.find('#status-filter').setValue('todo')
    await wrapper.find('#title-search').setValue('导入')

    expect(wrapper.findAll('h3').map((heading) => heading.text())).toEqual([
      '导入标题测试',
    ])

    await wrapper.find('#status-filter').setValue('done')

    expect(wrapper.findAll('li')).toHaveLength(0)
    expect(wrapper.text()).toContain('没有找到标题包含“导入”的需求')

    await wrapper.find('#title-search').setValue('')

    expect(wrapper.findAll('li')).toHaveLength(0)
    expect(wrapper.text()).toContain('暂无符合条件的需求')
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(storedBeforeSearch)
  })
})
