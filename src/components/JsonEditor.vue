<template>
  <!--
    JsonEditor 组件 - 左侧 JSON 输入区域
    提供文本输入框供用户输入 JSON 字符串
    支持 v-model 双向绑定输入内容
  -->
  <div class="flex flex-col h-full theme-transition">
    <!-- 面板标题栏 -->
    <div
      class="flex items-center justify-between px-4 py-3 border-b"
      :style="{
        backgroundColor: 'var(--panel-bg)',
        borderColor: 'var(--border-color)'
      }"
    >
      <h2
        class="text-sm font-semibold uppercase tracking-wider"
        :style="{ color: 'var(--json-key)' }"
      >
        JSON 输入
      </h2>
      <!-- 行数和字符数统计 -->
      <span
        class="text-xs"
        :style="{ color: 'var(--text-muted)' }"
      >
        {{ lineCount }} 行 · {{ charCount }} 字符
      </span>
    </div>

    <!-- 文本编辑区 -->
    <textarea
      :value="modelValue"
      @input="onInput"
      placeholder="在此粘贴或输入 JSON 字符串..."
      class="flex-1 w-full px-4 py-3
             text-sm font-mono
             resize-none outline-none
             border-0
             transition-colors duration-200"
      :style="{
        backgroundColor: 'var(--editor-bg)',
        color: 'var(--editor-text)'
      }"
      spellcheck="false"
      wrap="off"
    ></textarea>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const lineCount = computed(() =>
  props.modelValue ? props.modelValue.split('\n').length : 0
)

const charCount = computed(() =>
  props.modelValue?.length ?? 0
)

const onInput = (e: Event) => {
  const target = e.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>
