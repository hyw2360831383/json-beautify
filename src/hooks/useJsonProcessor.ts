import { ref, computed, watch, type WatchStopHandle } from 'vue'
import { ProcessMode, type JsonProcessResult } from '@/types'

/** 自动格式化的防抖延迟（毫秒） */
const DEBOUNCE_DELAY = 300

/**
 * JSON 处理 Hook
 * 负责 JSON 的格式化、压缩、验证及语法高亮解析
 * 支持输入变化时自动实时格式化
 */
export function useJsonProcessor() {
  // ===== 响应式状态 =====
  /** 用户输入的原始 JSON 文本 */
  const input = ref('')
  /** 处理后的结果（带语法高亮的 HTML 片段） */
  const output = ref('')
  /** 错误信息 */
  const error = ref('')
  /** 当前处理模式 */
  const currentMode = ref<ProcessMode>(ProcessMode.FORMAT)
  /** 是否有处理结果 */
  const hasResult = computed(() => output.value.length > 0 || error.value.length > 0)
  /** 防抖定时器 ID */
  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  /** watch 停止句柄（用于 onUnmounted 清理） */
  let stopWatcher: WatchStopHandle | null = null

  /**
   * 将原始 JSON 文本转换为带语法高亮的 HTML
   * 采用"标记-替换-还原"策略，确保键名和字符串值被正确区分
   * @param rawJson - 已验证通过、格式化为字符串的 JSON
   * @returns 带 class 标签的 HTML 字符串
   */
  const highlightJson = (rawJson: string): string => {
    // 第一步：转义 HTML 特殊字符，防止 XSS
    let html = rawJson
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    // 第二步：将 JSON 键名（"key":）替换为临时标记，避免与字符串值混淆
    html = html.replace(
      /"((?:[^"\\]|\\.)*)"(\s*:)/g,
      (_, content: string, colon: string) => `\x00KEY\x00${content}\x00KEY_END\x00${colon}`
    )

    // 第三步：将剩余的字符串（即 JSON 中的值）包裹为高亮标签
    html = html.replace(
      /"((?:[^"\\]|\\.)*)"/g,
      '<span class="json-string">"$1"</span>'
    )

    // 第四步：高亮数字
    html = html.replace(
      /(^|[\s:\[,])(-?\d+\.?\d*(?:[eE][+-]?\d+)?)(?=[\s,\]}])/gm,
      '$1<span class="json-number">$2</span>'
    )

    // 第五步：高亮布尔值
    html = html.replace(
      /(^|[\s:\[,])(true|false)(?=[\s,\]}])/gm,
      '$1<span class="json-boolean">$2</span>'
    )

    // 第六步：高亮 null
    html = html.replace(
      /(^|[\s:\[,])(null)(?=[\s,\]}])/gm,
      '$1<span class="json-null">$2</span>'
    )

    // 第七步：高亮括号
    html = html.replace(
      /([{}[\]])/g,
      '<span class="json-bracket">$1</span>'
    )

    // 第八步：还原键名标记
    html = html.replace(
      /\x00KEY\x00(.*?)\x00KEY_END\x00/g,
      '<span class="json-key">"$1"</span>'
    )

    // 第九步：保留换行符
    html = html.replace(/\n/g, '<br>')

    // 第十步：保留连续空格
    html = html.replace(/ {2,}/g, (match: string) =>
      '&nbsp;'.repeat(match.length)
    )

    return html
  }

  /**
   * 将 JSON.parse 抛出的原生错误转为用户友好的中文提示
   */
  const friendlyError = (errMsg: string): string => {
    const posMatch = errMsg.match(/position (\d+)(?: \(line (\d+) column (\d+)\))?/)
    const location = posMatch
      ? `（第 ${posMatch[2] || '?'} 行，第 ${posMatch[3] || '?'} 列）`
      : ''

    if (errMsg.includes('Bad control character')) {
      return `字符串值中包含未转义的控制字符（如换行、缩进等）${location}\n请确保字符串用双引号包裹且内部特殊字符已转义`
    }
    if (errMsg.includes('Unexpected end of JSON input')) {
      return `JSON 不完整，可能缺少闭合的 } 或 ] 括号${location}`
    }
    if (errMsg.includes('Unexpected token')) {
      return `JSON 语法错误，可能存在多余的逗号或格式不正确${location}`
    }
    if (errMsg.includes("Expected ',' or '}'")) {
      return `缺少逗号或闭合花括号 } ${location}`
    }
    if (errMsg.includes("Expected ':'")) {
      return `键名后缺少冒号 : ${location}`
    }
    if (errMsg.includes('Unexpected string')) {
      return `此处不应出现字符串，可能键名缺少引号或逗号${location}`
    }
    if (errMsg.includes('Unexpected number')) {
      return `数字出现位置不正确${location}`
    }

    return `JSON 格式错误${location}：${errMsg.replace(/^SyntaxError:\s*/i, '').replace(/ in JSON at position \d+/i, '')}`
  }

  /**
   * 验证并处理 JSON 字符串
   */
  const processJson = (jsonStr: string, mode: ProcessMode): JsonProcessResult => {
    if (!jsonStr || !jsonStr.trim()) {
      return { content: '', success: false, error: '请输入 JSON 字符串' }
    }

    try {
      const parsed = JSON.parse(jsonStr)
      const indent = mode === ProcessMode.FORMAT ? 2 : undefined
      const processed = JSON.stringify(parsed, null, indent)
      return { content: processed, success: true }
    } catch (e) {
      const rawMsg = e instanceof SyntaxError ? e.message : 'JSON 解析失败'
      return { content: '', success: false, error: friendlyError(rawMsg) }
    }
  }

  /**
   * 执行 JSON 处理并更新 output / error 状态
   */
  const handleProcess = (mode: ProcessMode) => {
    currentMode.value = mode
    const result = processJson(input.value, mode)

    if (result.success) {
      output.value = highlightJson(result.content)
      error.value = ''
    } else {
      // 格式不对时显示错误提示
      output.value = ''
      error.value = result.error || ''
    }
  }

  /** 清除所有内容 */
  const clear = () => {
    input.value = ''
    output.value = ''
    error.value = ''
    currentMode.value = ProcessMode.FORMAT
  }

  // ===== 自动格式化：监听 input 变化 =====
  stopWatcher = watch(input, (newVal) => {
    if (debounceTimer) clearTimeout(debounceTimer)

    if (!newVal || !newVal.trim()) {
      output.value = ''
      error.value = ''
      return
    }

    debounceTimer = setTimeout(() => {
      handleProcess(currentMode.value)
    }, DEBOUNCE_DELAY)
  })

  /** 组件卸载时清理 */
  const dispose = () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    if (stopWatcher) stopWatcher()
  }

  return {
    input,
    output,
    error,
    hasResult,
    currentMode,
    handleProcess,
    clear,
    dispose,
  }
}
