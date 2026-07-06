<template>
  <!--
    ThemeSwitcher 组件 - 主题切换按钮
    提供深色/浅色主题一键切换
  -->
  <button
    @click="toggle"
    class="p-2 rounded-md transition-all duration-200"
    :style="{ backgroundColor: 'var(--btn-hover-bg)' }"
    :title="isDark ? '切换到浅色主题' : '切换到深色主题'"
  >
    <!-- 太阳图标（浅色模式） -->
    <svg
      v-if="!isDark"
      class="w-4 h-4"
      fill="none" viewBox="0 0 24 24" stroke="currentColor"
      :style="{ color: 'var(--text-primary)' }"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
    <!-- 月亮图标（深色模式） -->
    <svg
      v-else
      class="w-4 h-4"
      fill="none" viewBox="0 0 24 24" stroke="currentColor"
      :style="{ color: 'var(--text-primary)' }"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Theme } from '@/types'

// ===== Props =====
const props = defineProps<{
  /** 当前主题 */
  modelValue: Theme
}>()

// ===== Emits =====
const emit = defineEmits<{
  /** 更新主题 */
  'update:modelValue': [value: Theme]
}>()

// ===== 计算属性 =====
/** 当前是否为深色主题 */
const isDark = computed(() => props.modelValue === Theme.DARK)

// ===== 方法 =====
/** 切换主题 */
const toggle = () => {
  emit('update:modelValue', isDark.value ? Theme.LIGHT : Theme.DARK)
}
</script>
