<template>
  <!--
    JsonViewer 组件 - 右侧 JSON 结果显示区域
    以只读方式展示格式化/压缩后的 JSON，支持语法高亮
    显示错误信息或空状态提示
    底部集成操作按钮（格式化 / 压缩 / 复制）
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
        :style="{ color: 'var(--success-text)' }"
      >
        处理结果
      </h2>
      <!-- 状态标签 -->
      <span
        v-if="resultStatus"
        class="text-xs px-2 py-0.5 rounded font-mono"
        :style="resultStatusStyle"
      >
        {{ resultStatus }}
      </span>
    </div>

    <!-- 结果展示区 -->
    <div class="flex-1 overflow-auto relative">
      <!-- 成功：显示语法高亮的结果 -->
      <div
        v-if="htmlContent"
        class="json-output w-full h-full px-4 py-3
               text-sm font-mono leading-relaxed
               select-text overflow-auto
               whitespace-pre-wrap break-all"
        :style="{ color: 'var(--text-primary)' }"
        v-html="htmlContent"
      ></div>

      <!-- 失败：显示错误信息 -->
      <div
        v-else-if="errorMessage"
        class="w-full h-full px-4 py-3 text-sm font-mono flex items-start"
      >
        <div
          class="border rounded-lg p-4 w-full"
          :style="{
            backgroundColor: 'var(--error-bg)',
            borderColor: 'var(--error-border)'
          }"
        >
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                 :style="{ color: 'var(--error-text)' }">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="font-semibold text-xs uppercase" :style="{ color: 'var(--error-text)' }">
              解析错误
            </span>
          </div>
          <p class="text-sm" :style="{ color: 'var(--error-text)' }">{{ errorMessage }}</p>
        </div>
      </div>

      <!-- 空状态：提示用户操作 -->
      <div
        v-else
        class="absolute inset-0 flex flex-col items-center justify-center gap-3"
        :style="{ color: 'var(--text-muted)' }"
      >
        <svg class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"
             :style="{ color: 'var(--text-muted)' }">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 5 4 6 4 7z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M4 7l8 5 8-5" />
        </svg>
        <p class="text-sm">在左侧输入 JSON，结果将自动实时显示</p>
      </div>
    </div>

    <!-- 底部操作按钮栏 -->
    <div
      class="flex items-center gap-2 px-4 py-2.5 border-t"
      :style="{
        backgroundColor: 'var(--panel-bg)',
        borderColor: 'var(--border-color)'
      }"
    >
      <!-- 格式化按钮 -->
      <button
        @click="$emit('format')"
        class="px-3 py-1.5 text-xs font-medium text-white rounded-md
               transition-all duration-200 active:scale-95
               flex items-center gap-1.5"
        :style="{ backgroundColor: 'var(--accent)' }"
        @mouseenter="(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--accent-hover)'"
        @mouseleave="(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--accent)'"
        title="格式化 JSON（美化缩进）"
      >
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
        格式化
      </button>

      <!-- 压缩按钮 -->
      <button
        @click="$emit('compress')"
        class="px-3 py-1.5 text-xs font-medium rounded-md
               transition-all duration-200 active:scale-95
               flex items-center gap-1.5"
        :style="{
          backgroundColor: 'var(--btn-hover-bg)',
          color: 'var(--btn-text)',
          border: `1px solid var(--btn-border)`
        }"
        title="压缩 JSON（移除空格和换行）"
      >
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 4h16M4 20h16M10 12l-2-2m0 0l2-2m-2 2h8" />
        </svg>
        压缩
      </button>

      <!-- 分隔线 -->
      <div
        class="w-px h-5 mx-1"
        :style="{ backgroundColor: 'var(--border-color)' }"
      ></div>

      <!-- 复制按钮 -->
      <button
        @click="$emit('copy')"
        :disabled="!hasResult"
        class="px-3 py-1.5 text-xs font-medium rounded-md
               transition-all duration-200 active:scale-95
               flex items-center gap-1.5"
        :style="{
          backgroundColor: hasResult ? 'var(--btn-hover-bg)' : 'transparent',
          color: hasResult ? 'var(--btn-text)' : 'var(--btn-disabled)',
          border: `1px solid var(--btn-border)`,
          cursor: hasResult ? 'pointer' : 'not-allowed',
          opacity: hasResult ? 1 : 0.4
        }"
        title="复制处理后的 JSON"
      >
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
        </svg>
        复制
      </button>

      <!-- 右侧弹性空间 -->
      <div class="flex-1"></div>

      <!-- 复制成功提示 -->
      <Transition name="fade">
        <span
          v-if="copyMessage"
          class="text-xs font-medium select-none"
          :style="{ color: 'var(--success-text)' }"
        >
          {{ copyMessage }}
        </span>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  htmlContent: string
  errorMessage: string
  hasResult: boolean
  copyMessage: string
}>()

defineEmits<{
  format: []
  compress: []
  copy: []
}>()

const resultStatus = computed(() => {
  if (props.htmlContent) return 'JSON ✓'
  if (props.errorMessage) return 'ERROR'
  return ''
})

const resultStatusStyle = computed(() => {
  if (props.htmlContent) {
    return {
      backgroundColor: 'var(--success-bg)',
      color: 'var(--success-text)',
    }
  }
  if (props.errorMessage) {
    return {
      backgroundColor: 'var(--error-bg)',
      color: 'var(--error-text)',
    }
  }
  return {}
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
