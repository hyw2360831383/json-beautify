import { ref } from 'vue'

/** 复制成功提示持续时间（毫秒） */
const MESSAGE_DURATION = 2000

/**
 * 剪贴板操作 Hook
 * 提供复制文本到剪贴板的功能，含成功提示
 */
export function useClipboard() {
  /** 提示消息内容 */
  const message = ref('')
  /** 是否正在显示提示消息 */
  const showMessage = ref(false)
  /** 提示消息定时器 */
  let timer: ReturnType<typeof setTimeout> | null = null

  /**
   * 复制文本到剪贴板
   * @param text - 要复制的文本
   */
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      message.value = '已复制到剪贴板！'
      showMessage.value = true

      // 清除之前的定时器
      if (timer) clearTimeout(timer)
      // 定时隐藏提示
      timer = setTimeout(() => {
        showMessage.value = false
      }, MESSAGE_DURATION)
    } catch {
      // 降级方案：使用 textarea 选中复制
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
        message.value = '已复制到剪贴板！'
        showMessage.value = true
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
          showMessage.value = false
        }, MESSAGE_DURATION)
      } catch {
        message.value = '复制失败，请手动复制'
        showMessage.value = true
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
          showMessage.value = false
        }, MESSAGE_DURATION)
      }
      document.body.removeChild(textarea)
    }
  }

  return { message, showMessage, copyToClipboard }
}
