<script setup lang="ts">
import RequirementItem from './RequirementItem.vue'
import type { Requirement, RequirementStatus } from '../types/requirement'

defineProps<{
  requirements: Requirement[]
}>()

const emit = defineEmits<{
  'update-status': [id: string, status: RequirementStatus]
}>()
</script>

<template>
  <section class="requirement-section" aria-labelledby="requirements-heading">
    <div class="section-heading">
      <h2 id="requirements-heading">需求列表</h2>
      <span class="requirement-count">{{ requirements.length }} 条</span>
    </div>

    <p v-if="requirements.length === 0" class="empty-state">
      暂无需求，先添加第一条吧。
    </p>

    <ul v-else class="requirement-list">
      <RequirementItem
        v-for="requirement in requirements"
        :key="requirement.id"
        :requirement="requirement"
        @update-status="(id, status) => emit('update-status', id, status)"
      />
    </ul>
  </section>
</template>
