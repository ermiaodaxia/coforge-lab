<script setup lang="ts">
import { computed, ref } from 'vue'
import RequirementItem from './RequirementItem.vue'
import {
  REQUIREMENT_STATUSES,
  STATUS_LABELS,
  type Requirement,
  type RequirementFilter,
  type RequirementStatus,
} from '../types/requirement'

const props = defineProps<{
  requirements: Requirement[]
}>()

const emit = defineEmits<{
  'update-status': [id: string, status: RequirementStatus]
}>()

const statusFilter = ref<RequirementFilter>('all')

const visibleRequirements = computed(() =>
  statusFilter.value === 'all'
    ? props.requirements
    : props.requirements.filter((requirement) => requirement.status === statusFilter.value),
)

const countLabel = computed(() =>
  statusFilter.value === 'all'
    ? `${props.requirements.length} 条`
    : `${visibleRequirements.value.length} / ${props.requirements.length} 条`,
)

function handleFilterChange(event: Event): void {
  statusFilter.value = (event.target as HTMLSelectElement).value as RequirementFilter
}
</script>

<template>
  <section class="requirement-section" aria-labelledby="requirements-heading">
    <div class="section-heading">
      <h2 id="requirements-heading">需求列表</h2>
      <div class="list-toolbar">
        <label for="status-filter">状态筛选</label>
        <select id="status-filter" :value="statusFilter" @change="handleFilterChange">
          <option value="all">全部</option>
          <option v-for="status in REQUIREMENT_STATUSES" :key="status" :value="status">
            {{ STATUS_LABELS[status] }}
          </option>
        </select>
        <span class="requirement-count">{{ countLabel }}</span>
      </div>
    </div>

    <p v-if="requirements.length === 0" class="empty-state">
      暂无需求，先添加第一条吧。
    </p>

    <p v-else-if="visibleRequirements.length === 0" class="empty-state">
      暂无符合条件的需求
    </p>

    <ul v-else class="requirement-list">
      <RequirementItem
        v-for="requirement in visibleRequirements"
        :key="requirement.id"
        :requirement="requirement"
        @update-status="(id, status) => emit('update-status', id, status)"
      />
    </ul>
  </section>
</template>
