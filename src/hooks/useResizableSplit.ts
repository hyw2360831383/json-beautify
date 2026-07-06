import { ref } from 'vue'

/** 左侧面板默认宽度百分比 */
const DEFAULT_LEFT_WIDTH = 50

/**
 * 可拖拽分栏 Hook
 * 支持左右面板宽度自由拖拽调节
 */
export function useResizableSplit() {
  /** 左侧面板宽度百分比 */
  const leftWidth = ref(DEFAULT_LEFT_WIDTH)
  /** 是否正在拖拽中 */
  const isDragging = ref(false)

  /**
   * 分隔条鼠标按下事件处理
   * 注册全局 mousemove / mouseup 事件实现拖拽
   */
  const onDividerMouseDown = (e: MouseEvent) => {
    e.preventDefault()
    isDragging.value = true

    const container = (e.target as HTMLElement).parentElement!
    const containerWidth = container.getBoundingClientRect().width
    const startX = e.clientX
    const startWidth = leftWidth.value

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX
      const deltaPercent = (deltaX / containerWidth) * 100
      const newWidth = startWidth + deltaPercent
      // 限制范围：20% ~ 80%
      leftWidth.value = Math.max(20, Math.min(80, newWidth))
    }

    const onMouseUp = () => {
      isDragging.value = false
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  return { leftWidth, isDragging, onDividerMouseDown }
}
