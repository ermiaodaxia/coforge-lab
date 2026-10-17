<script setup lang="ts">
import { computed, ref } from 'vue'
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
}>()

const DESCRIPTION_PREVIEW_LENGTH = 80

const expanded = ref(false)

const descriptionCharacters = computed(() => Array.from(props.requirement.description))

const isDescriptionTruncatable = computed(
  () => descriptionCharacters.value.length > DESCRIPTION_PREVIEW_LENGTH,
)

const displayedDescription = computed(() => {
  if (!isDescriptionTruncatable.value || expanded.value) {
    return props.requirement.description
  }

  return `${descriptionCharacters.value.slice(0, DESCRIPTION_PREVIEW_LENGTH).join('')}…`
})

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
</script>

<template>
  <li class="requirement-item">
    <div class="requirement-content">
      <h3>{{ requirement.title }}</h3>
      <div v-if="requirement.description" class="requirement-description-block">
        <p
          :id="`description-${requirement.id}`"
          class="requirement-description"
        >
          {{ displayedDescription }}
        </p>
        <button
          v-if="isDescriptionTruncatable"
          type="button"
          class="description-toggle"
          :aria-expanded="expanded"
          :aria-controls="`description-${requirement.id}`"
          @click="expanded = !expanded"
        >
          {{ expanded ? '收起' : '展开' }}
        </button>
      </div>
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
  </li>
</template>
