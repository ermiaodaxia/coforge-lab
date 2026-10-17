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

    await wrapper.find('select').setValue('done')

    expect(wrapper.find('select').element.value).toBe('done')
    expect(window.localStorage.getItem(STORAGE_KEY)).toContain('"status":"done"')
  })
})
