<template>
  <!--
    Toolbar 组件 - 工具栏
    提供清空输入和主题切换功能
  -->
  <div
    class="flex items-center justify-between px-4 py-2 border-b"
    :style="{
      backgroundColor: 'var(--panel-bg)',
      borderColor: 'var(--border-color)'
    }"
  >
    <!-- 清空按钮 -->
    <button
      @click="$emit('clear')"
      :disabled="!hasInput"
      class="px-3 py-1.5 text-xs font-medium rounded-md
             transition-all duration-200 active:scale-95
             flex items-center gap-1.5"
      :style="{
        backgroundColor: hasInput ? 'var(--btn-hover-bg)' : 'transparent',
        color: hasInput ? 'var(--btn-text)' : 'var(--btn-disabled)',
        border: `1px solid var(--btn-border)`,
        cursor: hasInput ? 'pointer' : 'not-allowed',
        opacity: hasInput ? 1 : 0.4
      }"
      title="清空输入和结果"
    >
      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      清空
    </button>

    <!-- 主题切换 -->
    <ThemeSwitcher v-model="currentTheme" @update:model-value="$emit('theme-change', $event)" />
  </div>
</template>

<script setup lang="ts">
import { Theme } from '@/types'
import ThemeSwitcher from './ThemeSwitcher.vue'

// ===== Props =====
defineProps<{
  /** 是否有输入内容 */
  hasInput: boolean
  /** 当前主题 */
  currentTheme: Theme
}>()

// ===== Emits =====
defineEmits<{
  /** 清空操作 */
  clear: []
  /** 主题切换 */
  'theme-change': [theme: Theme]
}>()
</script>
