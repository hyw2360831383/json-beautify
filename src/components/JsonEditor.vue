<template>
  <!--
    JsonEditor 组件 - 左侧 JSON 输入区域
    使用"透明 textarea + 高亮 pre 背景"技术实现输入实时语法高亮
    支持行号显示、拖拽导入、文件选择导入
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
      <div class="flex items-center gap-2">
        <h2
          class="text-sm font-semibold uppercase tracking-wider"
          :style="{ color: 'var(--json-key)' }"
        >
          JSON 输入
        </h2>
        <!-- 导入文件按钮 -->
        <button
          class="import-btn"
          title="导入 JSON 文件（支持拖拽到编辑区）"
          @click="triggerFileInput"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>
        <input
          ref="fileInputRef"
          type="file"
          accept=".json,.txt,.jsonc"
          class="hidden"
          @change="onFileSelected"
        />
      </div>
      <!-- 行数和字符数统计 -->
      <span
        class="text-xs"
        :style="{ color: 'var(--text-muted)' }"
      >
        {{ lineCount }} 行 · {{ charCount }} 字符
      </span>
    </div>

    <!-- 编辑主体：行号 + 高亮编辑区 -->
    <div class="flex-1 flex overflow-hidden">
      <!-- 行号列 -->
      <div
        ref="lineNumbersRef"
        class="editor-line-numbers select-none overflow-hidden flex-shrink-0"
        :style="{ color: 'var(--text-muted)' }"
      >
        <pre class="line-numbers-inner">{{ inputLineNumbers }}</pre>
      </div>

      <!-- 高亮编辑区 -->
      <div
        class="flex-1 relative overflow-hidden"
        @dragover.prevent="onDragOver"
        @dragleave="onDragLeave"
        @drop.prevent="onDrop"
      >
        <!-- 底层：语法高亮背景 -->
        <pre
          ref="backdropRef"
          class="highlight-backdrop"
          v-html="highlightedInput"
          aria-hidden="true"
        ></pre>

        <!-- 顶层：透明 textarea 接收输入 -->
        <textarea
          ref="textareaRef"
          :value="modelValue"
          @input="onInput"
          @scroll="syncScroll"
          placeholder="在此粘贴或输入 JSON 字符串..."
          class="highlight-textarea"
          spellcheck="false"
          wrap="off"
        ></textarea>

        <!-- 拖拽导入遮罩 -->
        <div
          v-if="isDragOver"
          class="drag-overlay"
          :style="{ borderColor: 'var(--accent)' }"
        >
          <svg class="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"
               :style="{ color: 'var(--accent)' }">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <p class="text-sm font-medium" :style="{ color: 'var(--accent)' }">
            释放文件以导入 JSON
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { highlightJsonCore } from '@/hooks/useJsonProcessor'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const backdropRef = ref<HTMLPreElement | null>(null)
const lineNumbersRef = ref<HTMLDivElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragOver = ref(false)
let dragCounter = 0

/** 输入内容带语法高亮的 HTML */
const highlightedInput = computed(() => {
  if (!props.modelValue) return ''
  return highlightJsonCore(props.modelValue)
})

const lineCount = computed(() =>
  props.modelValue ? props.modelValue.split('\n').length : 0
)

const charCount = computed(() =>
  props.modelValue?.length ?? 0
)

/** 输入区行号文本 */
const inputLineNumbers = computed(() => {
  const count = lineCount.value || 1
  return Array.from({ length: count }, (_, i) => i + 1).join('\n')
})

/** textarea 滚动时同步 pre 背景和行号的滚动位置 */
const syncScroll = () => {
  if (!textareaRef.value) return
  if (backdropRef.value) {
    backdropRef.value.scrollTop = textareaRef.value.scrollTop
    backdropRef.value.scrollLeft = textareaRef.value.scrollLeft
  }
  if (lineNumbersRef.value) {
    lineNumbersRef.value.scrollTop = textareaRef.value.scrollTop
  }
}

const onInput = (e: Event) => {
  const target = e.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}

// ===== 拖拽导入 =====
const onDragOver = () => {
  isDragOver.value = true
}

const onDragLeave = (e: DragEvent) => {
  // 仅当真正离开容器时才隐藏遮罩
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const { clientX, clientY } = e
  if (clientX <= rect.left || clientX >= rect.right || clientY <= rect.top || clientY >= rect.bottom) {
    isDragOver.value = false
  }
}

const onDrop = (e: DragEvent) => {
  isDragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) readFile(file)
}

// ===== 文件选择导入 =====
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const onFileSelected = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) readFile(file)
  // 重置以允许重复选择同一文件
  input.value = ''
}

/** 读取文件内容并设置为输入 */
const readFile = (file: File) => {
  const reader = new FileReader()
  reader.onload = () => {
    const text = reader.result as string
    emit('update:modelValue', text)
  }
  reader.onerror = () => {
    console.error('文件读取失败')
  }
  reader.readAsText(file, 'UTF-8')
}
</script>

<style scoped>
/* ===== 行号列 ===== */
.editor-line-numbers {
  padding: 0.75rem 0;
  text-align: right;
  min-width: 3rem;
  border-right: 1px solid var(--border-color);
  background-color: var(--panel-bg);
  overflow: hidden;
}

.line-numbers-inner {
  font-size: 0.875rem;
  line-height: 1.625;
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas,
    'Liberation Mono', monospace;
  padding: 0 0.75rem 0 0.5rem;
  margin: 0;
  white-space: pre;
  tab-size: 2;
}

/* ===== 高亮编辑区 ===== */
.highlight-backdrop,
.highlight-textarea {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  line-height: 1.625;
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas,
    'Liberation Mono', monospace;
  overflow: auto;
  white-space: pre;
  tab-size: 2;
  margin: 0;
  border: 0;
}

.highlight-backdrop {
  color: var(--text-primary);
  background-color: var(--editor-bg);
  pointer-events: none;
  z-index: 0;
}

.highlight-textarea {
  color: transparent;
  caret-color: var(--editor-text);
  background: transparent;
  resize: none;
  outline: none;
  z-index: 1;
}

.highlight-textarea::placeholder {
  color: var(--text-muted);
  opacity: 1;
}

.highlight-textarea::selection {
  background-color: rgba(59, 130, 246, 0.3);
}

/* ===== 导入按钮 ===== */
.import-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.import-btn:hover {
  color: var(--accent);
  background-color: var(--btn-hover-bg);
  border-color: var(--btn-border);
}

.hidden {
  display: none;
}

/* ===== 拖拽遮罩 ===== */
.drag-overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(15, 23, 42, 0.85);
  border: 2px dashed;
  border-radius: 4px;
  pointer-events: none;
}
</style>
