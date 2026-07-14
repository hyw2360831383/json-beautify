<template>
  <!--
    App 根组件 - JSON 格式化工具主页面
    布局：顶部标题栏 + 工具栏 + 下方可拖拽左右分栏（输入 / 输出）
    支持实时自动格式化、多主题切换、面板宽度自由调节
  -->
  <div
    class="flex flex-col h-screen overflow-hidden theme-transition"
    :style="{ backgroundColor: 'var(--app-bg)' }"
  >
    <!-- 顶部标题栏 -->
    <header
      class="flex items-center justify-between px-4 py-3 border-b"
      :style="{
        backgroundColor: 'var(--header-bg)',
        borderColor: 'var(--header-border)'
      }"
    >
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500
                    flex items-center justify-center text-white font-bold text-sm">
          J
        </div>
        <h1
          class="text-lg font-semibold tracking-tight"
          :style="{ color: 'var(--text-primary)' }"
        >
          JSON Beautify
        </h1>
        <span
          class="text-xs hidden sm:inline"
          :style="{ color: 'var(--text-muted)' }"
        >
          格式化 · 压缩 · 高亮
        </span>
      </div>
      <div class="hidden md:flex items-center gap-3 text-xs">
        <span class="flex items-center gap-1" :style="{ color: 'var(--text-muted)' }">
          <kbd
            class="px-1.5 py-0.5 rounded text-[10px] font-mono"
            :style="{
              backgroundColor: 'var(--kbd-bg)',
              color: 'var(--kbd-text)'
            }"
          >Ctrl+Enter</kbd>
          格式化
        </span>
      </div>
    </header>

    <!-- 工具栏（清空 + 主题切换） -->
    <Toolbar
      :has-input="!!input"
      :current-theme="currentTheme"
      @clear="handleClear"
      @theme-change="handleThemeChange"
    />

    <!-- 主内容区域：左右分栏 + 可拖拽分隔条 -->
    <main class="flex-1 flex overflow-hidden">
      <!-- 左侧：JSON 输入编辑区 -->
      <section
        class="min-w-0 overflow-hidden"
        :style="{
          width: leftWidth + '%',
          borderRight: isDragging ? 'none' : `1px solid var(--border-color)`
        }"
      >
        <JsonEditor v-model="input" />
      </section>

      <!-- 可拖拽分隔条 -->
      <div
        class="resize-divider flex-shrink-0 select-none flex items-center justify-center"
        :class="{ 'resizing': isDragging }"
        :style="{ width: '6px' }"
        @mousedown="onDividerMouseDown"
        title="拖拽调整左右宽度"
      >
        <div class="w-1 h-8 rounded-full opacity-50" :style="{ backgroundColor: 'var(--text-muted)' }"></div>
      </div>

      <!-- 右侧：JSON 处理结果展示区 -->
      <section class="flex-1 min-w-0 overflow-hidden">
        <JsonViewer
          :html-content="output"
          :error-message="error"
          :has-result="hasResult"
          :is-valid-json="isValidJson"
          :copy-message="showMessage ? clipboardMessage : ''"
          @format="handleFormat"
          @compress="handleCompress"
          @copy="handleCopy"
        />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { ProcessMode } from './types'
import { useJsonProcessor } from './hooks/useJsonProcessor'
import { useClipboard } from './hooks/useClipboard'
import { useTheme } from './hooks/useTheme'
import { useResizableSplit } from './hooks/useResizableSplit'
import Toolbar from './components/Toolbar.vue'
import JsonEditor from './components/JsonEditor.vue'
import JsonViewer from './components/JsonViewer.vue'

// ===== 引入 Hook =====
const { input, output, error, hasResult, isValidJson, handleProcess, clear, dispose } = useJsonProcessor()
const { message: clipboardMessage, showMessage, copyToClipboard } = useClipboard()
const { currentTheme, setTheme } = useTheme()
const { leftWidth, isDragging, onDividerMouseDown } = useResizableSplit()

// ===== 操作方法 =====
const handleFormat = () => {
  handleProcess(ProcessMode.FORMAT)
}

const handleCompress = () => {
  handleProcess(ProcessMode.COMPRESS)
}

const handleCopy = () => {
  const plainText = output.value
    .replace(/<br>/g, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')

  copyToClipboard(plainText)
}

const handleClear = () => {
  clear()
}

const handleThemeChange = (theme: import('./types').Theme) => {
  setTheme(theme)
}

// ===== 键盘快捷键 =====
const handleKeydown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault()
    handleFormat()
  }
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  dispose()
})
</script>
