<script setup lang="ts">
import RequirementForm from './components/RequirementForm.vue'
import RequirementList from './components/RequirementList.vue'
import { useRequirements } from './composables/useRequirements'
import type { RequirementStatus } from './types/requirement'

const { requirements, persistenceError, addRequirement, updateStatus } =
  useRequirements()

function handleSubmit(payload: { title: string; description: string }): void {
  addRequirement(payload.title, payload.description)
}

function handleStatusChange(id: string, status: RequirementStatus): void {
  updateStatus(id, status)
}
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <p class="eyebrow">CoForge Lab · 共研实验室</p>
      <h1>需求收集小工具</h1>
      <p class="app-subtitle">
        记录产品需求，跟踪从待处理到完成的整个过程。数据仅保存在当前浏览器中。
      </p>
    </header>

    <main class="app-main">
      <RequirementForm @submit="handleSubmit" />

      <p v-if="persistenceError" class="storage-warning" role="status">
        {{ persistenceError }}
      </p>

      <RequirementList
        :requirements="requirements"
        @update-status="handleStatusChange"
      />
    </main>

    <footer class="app-footer">第一版不包含后端、登录或多人权限。</footer>
  </div>
</template>
