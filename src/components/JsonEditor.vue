<template>
  <!--
    JsonEditor 组件 - 左侧 JSON 输入区域
    使用"透明 textarea + 高亮 pre 背景"技术实现输入实时语法高亮
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

    <!-- 高亮编辑区：透明 textarea 叠在高亮 pre 之上 -->
    <div class="flex-1 relative overflow-hidden">
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

/** textarea 滚动时同步 pre 背景的滚动位置 */
const syncScroll = () => {
  if (!textareaRef.value || !backdropRef.value) return
  backdropRef.value.scrollTop = textareaRef.value.scrollTop
  backdropRef.value.scrollLeft = textareaRef.value.scrollLeft
}

const onInput = (e: Event) => {
  const target = e.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>

<style scoped>
/* 底层高亮背景和顶层 textarea 共享完全相同的尺寸与排版 */
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

/* 高亮背景层：置于下层，不可交互 */
.highlight-backdrop {
  color: var(--text-primary);
  background-color: var(--editor-bg);
  pointer-events: none;
  z-index: 0;
}

/* 透明输入层：置于上层，文字透明但光标可见 */
.highlight-textarea {
  color: transparent;
  caret-color: var(--editor-text);
  background: transparent;
  resize: none;
  outline: none;
  z-index: 1;
}

/* placeholder 保持可见 */
.highlight-textarea::placeholder {
  color: var(--text-muted);
  opacity: 1;
}

/* 文本选中时显示半透明蓝色覆盖层 */
.highlight-textarea::selection {
  background-color: rgba(59, 130, 246, 0.3);
}
</style>
