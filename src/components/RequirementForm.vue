<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  submit: [payload: { title: string; description: string }]
}>()

const title = ref('')
const description = ref('')
const error = ref('')

function handleSubmit(): void {
  const trimmedTitle = title.value.trim()
  if (!trimmedTitle) {
    error.value = '请输入需求标题'
    return
  }

  emit('submit', {
    title: trimmedTitle,
    description: description.value.trim(),
  })
  title.value = ''
  description.value = ''
  error.value = ''
}
</script>

<template>
  <form class="requirement-form" novalidate @submit.prevent="handleSubmit">
    <div class="field">
      <label for="requirement-title">
        需求标题 <span class="required-mark" aria-hidden="true">*</span>
      </label>
      <input
        id="requirement-title"
        v-model="title"
        type="text"
        placeholder="例如：支持导出需求列表"
        autocomplete="off"
        :aria-invalid="Boolean(error)"
        :aria-describedby="error ? 'title-error' : undefined"
        @input="error = ''"
      />
    </div>

    <div class="field">
      <label for="requirement-description">需求描述（选填）</label>
      <textarea
        id="requirement-description"
        v-model="description"
        rows="3"
        placeholder="补充背景、目标或验收要点"
      />
    </div>

    <p v-if="error" id="title-error" class="form-error" role="alert">
      {{ error }}
    </p>

    <button type="submit" class="primary-button">新增需求</button>
  </form>
</template>
