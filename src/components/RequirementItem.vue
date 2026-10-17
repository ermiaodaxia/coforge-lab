<script setup lang="ts">
import { computed } from 'vue'
import {
  REQUIREMENT_STATUSES,
  STATUS_LABELS,
  type Requirement,
  type RequirementStatus,
} from '../types/requirement'

const props = defineProps<{
  requirement: Requirement
}>()

const emit = defineEmits<{
  'update-status': [id: string, status: RequirementStatus]
  delete: [id: string]
}>()

const createdAtLabel = computed(() =>
  new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(props.requirement.createdAt)),
)

function handleStatusChange(event: Event): void {
  emit(
    'update-status',
    props.requirement.id,
    (event.target as HTMLSelectElement).value as RequirementStatus,
  )
}

function handleDelete(): void {
  emit('delete', props.requirement.id)
}
</script>

<template>
  <li class="requirement-item">
    <div class="requirement-content">
      <h3>{{ requirement.title }}</h3>
      <p v-if="requirement.description" class="requirement-description">
        {{ requirement.description }}
      </p>
      <p class="requirement-meta">创建于 {{ createdAtLabel }}</p>
    </div>

    <div class="status-control">
      <label :for="`status-${requirement.id}`">状态</label>
      <select
        :id="`status-${requirement.id}`"
        :value="requirement.status"
        @change="handleStatusChange"
      >
        <option v-for="status in REQUIREMENT_STATUSES" :key="status" :value="status">
          {{ STATUS_LABELS[status] }}
        </option>
      </select>
    </div>

    <button
      type="button"
      class="delete-button"
      :aria-label="`删除需求：${requirement.title}`"
      @click="handleDelete"
    >
      删除
    </button>
  </li>
</template>
