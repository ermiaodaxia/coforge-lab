import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App.vue'
import { STORAGE_KEY } from '../composables/useRequirements'

afterEach(() => {
  vi.restoreAllMocks()
})

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

  it('deletes a requirement after confirmation and syncs list, counts, and storage', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const wrapper = mount(App)

    await wrapper.find('#requirement-title').setValue('保留需求')
    await wrapper.find('form').trigger('submit')
    await wrapper.find('#requirement-title').setValue('删除需求')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.text()).toContain('全部 2、待处理 2、进行中 0、已完成 0')

    const deletableItem = wrapper
      .findAll('.requirement-item')
      .find((item) => item.text().includes('删除需求'))
    await deletableItem!.find('.delete-button').trigger('click')

    expect(confirmSpy).toHaveBeenCalledWith('确定要删除需求「删除需求」吗？')
    expect(wrapper.findAll('h3').map((heading) => heading.text())).toEqual(['保留需求'])
    expect(wrapper.text()).toContain('全部 1、待处理 1、进行中 0、已完成 0')
    expect(wrapper.text()).toContain('1 条')

    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]') as Array<{
      title: string
    }>
    expect(stored.map((requirement) => requirement.title)).toEqual(['保留需求'])
    wrapper.unmount()

    const remounted = mount(App)

    expect(remounted.findAll('h3').map((heading) => heading.text())).toEqual(['保留需求'])
    expect(remounted.text()).not.toContain('删除需求')
    expect(remounted.text()).toContain('全部 1、待处理 1、进行中 0、已完成 0')
  })

  it('keeps the requirement when deletion is cancelled', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
    const wrapper = mount(App)

    await wrapper.find('#requirement-title').setValue('取消删除')
    await wrapper.find('form').trigger('submit')

    await wrapper.find('.delete-button').trigger('click')

    expect(confirmSpy).toHaveBeenCalledWith('确定要删除需求「取消删除」吗？')
    expect(wrapper.findAll('h3').map((heading) => heading.text())).toEqual(['取消删除'])
    expect(wrapper.text()).toContain('全部 1、待处理 1、进行中 0、已完成 0')
    expect(window.localStorage.getItem(STORAGE_KEY)).toContain('取消删除')
  })

  it('deletes and expands the correct item while a filter is active', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const longDescription = (marker: string) => `${'描述'.repeat(50)}${marker}`
    const wrapper = mount(App)

    await wrapper.find('#requirement-title').setValue('已完成甲')
    await wrapper.find('#requirement-description').setValue(longDescription('甲结尾'))
    await wrapper.find('form').trigger('submit')
    await wrapper.find('#requirement-title').setValue('已完成乙')
    await wrapper.find('#requirement-description').setValue(longDescription('乙结尾'))
    await wrapper.find('form').trigger('submit')
    await wrapper.find('#requirement-title').setValue('待处理丙')
    await wrapper.find('form').trigger('submit')

    await wrapper.findAll('.requirement-item select')[1].setValue('done')
    await wrapper.findAll('.requirement-item select')[2].setValue('done')
    await wrapper.find('#status-filter').setValue('done')

    expect(wrapper.findAll('h3').map((heading) => heading.text())).toEqual([
      '已完成乙',
      '已完成甲',
    ])

    const firstDone = wrapper.findAll('.requirement-item')[0]
    await firstDone.find('.description-toggle').trigger('click')

    expect(wrapper.findAll('.requirement-item')[0].find('.description-toggle').text()).toBe(
      '收起',
    )
    expect(wrapper.findAll('.requirement-item')[1].find('.description-toggle').text()).toBe(
      '展开',
    )

    await wrapper.findAll('.requirement-item')[1].find('.delete-button').trigger('click')

    expect(wrapper.findAll('h3').map((heading) => heading.text())).toEqual(['已完成乙'])
    expect(wrapper.text()).toContain('全部 2、待处理 1、进行中 0、已完成 1')
    expect(wrapper.text()).toContain('1 / 2 条')
    expect(wrapper.find('.description-toggle').text()).toBe('收起')
    expect(wrapper.find('.requirement-description').text()).toContain('乙结尾')

    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]') as Array<{
      title: string
    }>
    expect(stored.map((requirement) => requirement.title)).toEqual(['待处理丙', '已完成乙'])

    await wrapper.find('#status-filter').setValue('all')

    const items = wrapper.findAll('.requirement-item')
    expect(items.map((item) => item.find('h3').text())).toEqual(['待处理丙', '已完成乙'])
    expect(items[0].find('.description-toggle').exists()).toBe(false)
    expect(items[1].find('.description-toggle').text()).toBe('收起')
  })
})
