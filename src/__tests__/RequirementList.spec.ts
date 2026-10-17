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
    expect(wrapper.text()).not.toContain('暂无符合条件的需求')
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
    expect(
      (wrapper.findAll('.requirement-item select')[0].element as HTMLSelectElement).value,
    ).toBe('todo')
    expect(
      (wrapper.findAll('.requirement-item select')[1].element as HTMLSelectElement).value,
    ).toBe('done')
    expect(
      wrapper.findAll('.requirement-item option').map((option) => option.text()),
    ).toContain('进行中')
  })

  it('shows all requirements and the filter defaults to all', () => {
    const wrapper = mount(RequirementList, {
      props: { requirements },
    })

    expect((wrapper.find('#status-filter').element as HTMLSelectElement).value).toBe('all')
    expect(wrapper.findAll('h3')).toHaveLength(2)
    expect(wrapper.text()).toContain('2 条')
  })

  it('filters requirements by status and updates the count', async () => {
    const wrapper = mount(RequirementList, {
      props: { requirements },
    })

    await wrapper.find('#status-filter').setValue('done')

    expect(wrapper.findAll('h3').map((heading) => heading.text())).toEqual(['按状态筛选'])
    expect(wrapper.text()).not.toContain('支持 CSV 导出')
    expect(wrapper.text()).toContain('1 / 2 条')
  })

  it('shows all requirements again when the filter returns to all', async () => {
    const wrapper = mount(RequirementList, {
      props: { requirements },
    })

    await wrapper.find('#status-filter').setValue('done')
    await wrapper.find('#status-filter').setValue('all')

    expect(wrapper.findAll('h3').map((heading) => heading.text())).toEqual([
      '导出需求列表',
      '按状态筛选',
    ])
    expect(wrapper.text()).toContain('2 条')
  })

  it('shows a filter-specific empty state when nothing matches', async () => {
    const wrapper = mount(RequirementList, {
      props: {
        requirements: [requirements[0]],
      },
    })

    await wrapper.find('#status-filter').setValue('done')

    expect(wrapper.text()).toContain('暂无符合条件的需求')
    expect(wrapper.text()).not.toContain('暂无需求')
    expect(wrapper.findAll('li')).toHaveLength(0)
    expect(wrapper.find('#status-filter').exists()).toBe(true)
  })

  it('emits the requirement id and new status when a status is selected', async () => {
    const wrapper = mount(RequirementList, {
      props: { requirements },
    })

    await wrapper.findAll('.requirement-item select')[0].setValue('in-progress')

    expect(wrapper.emitted('update-status')).toEqual([
      ['requirement-1', 'in-progress'],
    ])
  })

  it('still emits status changes while a filter is active', async () => {
    const wrapper = mount(RequirementList, {
      props: { requirements },
    })

    await wrapper.find('#status-filter').setValue('done')
    await wrapper.find('.requirement-item select').setValue('in-progress')

    expect(wrapper.emitted('update-status')).toEqual([
      ['requirement-2', 'in-progress'],
    ])
  })

  it('shows status counts for all requirements regardless of the active filter', async () => {
    const wrapper = mount(RequirementList, {
      props: { requirements },
    })

    expect(wrapper.text()).toContain('全部 2、待处理 1、进行中 0、已完成 1')

    await wrapper.find('#status-filter').setValue('done')

    expect(wrapper.text()).toContain('全部 2、待处理 1、进行中 0、已完成 1')
  })

  it('updates the status counts when the requirements change', async () => {
    const wrapper = mount(RequirementList, {
      props: { requirements },
    })

    await wrapper.setProps({
      requirements: [
        ...requirements,
        {
          id: 'requirement-3',
          title: '进行中的需求',
          description: '',
          status: 'in-progress',
          createdAt: '2026-01-03T08:00:00.000Z',
          updatedAt: '2026-01-03T08:00:00.000Z',
        },
      ],
    })

    expect(wrapper.text()).toContain('全部 3、待处理 1、进行中 1、已完成 1')
  })

  it('shows the requirement count', () => {
    const wrapper = mount(RequirementList, {
      props: { requirements },
    })

    expect(wrapper.text()).toContain('2 条')
  })

  describe('title search', () => {
    const searchable: Requirement[] = [
      {
        id: 'search-1',
        title: 'Export CSV',
        description: '支持 CSV 导出',
        status: 'todo',
        createdAt: '2026-02-01T08:00:00.000Z',
        updatedAt: '2026-02-01T08:00:00.000Z',
      },
      {
        id: 'search-2',
        title: 'Reimport backup',
        description: '',
        status: 'in-progress',
        createdAt: '2026-02-02T08:00:00.000Z',
        updatedAt: '2026-02-02T08:00:00.000Z',
      },
      {
        id: 'search-3',
        title: '导入历史数据',
        description: '支持 CSV 导入',
        status: 'done',
        createdAt: '2026-02-03T08:00:00.000Z',
        updatedAt: '2026-02-03T08:00:00.000Z',
      },
    ]

    function mountSearchable() {
      return mount(RequirementList, { props: { requirements: searchable } })
    }

    it('filters requirements by a partial title match', async () => {
      const wrapper = mountSearchable()

      await wrapper.find('#title-search').setValue('backup')

      expect(wrapper.findAll('h3').map((heading) => heading.text())).toEqual([
        'Reimport backup',
      ])
      expect(wrapper.text()).toContain('1 / 3 条')
    })

    it('matches English titles case-insensitively', async () => {
      const wrapper = mountSearchable()

      await wrapper.find('#title-search').setValue('EXPORT')

      expect(wrapper.findAll('h3').map((heading) => heading.text())).toEqual([
        'Export CSV',
      ])
    })

    it('trims the search term before matching', async () => {
      const wrapper = mountSearchable()

      await wrapper.find('#title-search').setValue('  导入  ')

      expect(wrapper.findAll('h3').map((heading) => heading.text())).toEqual([
        '导入历史数据',
      ])
      expect(wrapper.text()).toContain('1 / 3 条')
    })

    it('treats a whitespace-only term as an empty search', async () => {
      const wrapper = mountSearchable()

      await wrapper.find('#title-search').setValue('   ')

      expect(wrapper.findAll('h3')).toHaveLength(3)
      expect(wrapper.text()).toContain('3 条')
      expect(wrapper.text()).not.toContain('没有找到标题包含')
    })

    it('does not match requirement descriptions', async () => {
      const wrapper = mountSearchable()

      await wrapper.find('#title-search').setValue('csv')

      expect(wrapper.findAll('h3').map((heading) => heading.text())).toEqual([
        'Export CSV',
      ])
    })

    it('intersects the search term with the status filter', async () => {
      const wrapper = mountSearchable()

      await wrapper.find('#status-filter').setValue('todo')
      await wrapper.find('#title-search').setValue('port')

      expect(wrapper.findAll('h3').map((heading) => heading.text())).toEqual([
        'Export CSV',
      ])
      expect(wrapper.text()).toContain('1 / 3 条')

      await wrapper.find('#title-search').setValue('backup')

      expect(wrapper.findAll('li')).toHaveLength(0)
      expect(wrapper.text()).toContain('没有找到标题包含“backup”的需求')
    })

    it('keeps the status filter when the search is cleared', async () => {
      const wrapper = mountSearchable()

      await wrapper.find('#status-filter').setValue('done')
      await wrapper.find('#title-search').setValue('backup')

      expect(wrapper.findAll('li')).toHaveLength(0)

      await wrapper.find('#title-search').setValue('')

      expect(
        (wrapper.find('#status-filter').element as HTMLSelectElement).value,
      ).toBe('done')
      expect(wrapper.findAll('h3').map((heading) => heading.text())).toEqual([
        '导入历史数据',
      ])
      expect(wrapper.text()).toContain('1 / 3 条')
    })

    it('shows an explicit message when the search has no matches', async () => {
      const wrapper = mountSearchable()

      await wrapper.find('#title-search').setValue('  不存在  ')

      expect(wrapper.text()).toContain('没有找到标题包含“不存在”的需求')
      expect(wrapper.text()).not.toContain('暂无符合条件的需求')
      expect(wrapper.text()).not.toContain('暂无需求，先添加第一条吧。')
    })

    it('keeps the global status counts independent from the search', async () => {
      const wrapper = mountSearchable()

      await wrapper.find('#title-search').setValue('backup')

      expect(wrapper.text()).toContain('全部 3、待处理 1、进行中 1、已完成 1')
    })
  })
})
