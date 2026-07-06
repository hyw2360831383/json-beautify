import { ref, watchEffect } from 'vue'
import { Theme } from '@/types'

const THEME_STORAGE_KEY = 'json-beautify-theme'

/**
 * 主题管理 Hook
 * 支持深色/浅色主题切换，并持久化到 localStorage
 */
export function useTheme() {
  /** 当前主题 */
  const currentTheme = ref<Theme>(Theme.DARK)

  // 初始化：从 localStorage 读取上次保存的主题
  const saved = localStorage.getItem(THEME_STORAGE_KEY)
  if (saved === Theme.LIGHT || saved === Theme.DARK) {
    currentTheme.value = saved
  }

  // 监听主题变化，同步到 DOM 和 localStorage
  watchEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme.value)
    localStorage.setItem(THEME_STORAGE_KEY, currentTheme.value)
  })

  /**
   * 切换主题
   * @param theme - 目标主题
   */
  const setTheme = (theme: Theme) => {
    currentTheme.value = theme
  }

  /** 在两个主题之间切换 */
  const toggleTheme = () => {
    currentTheme.value = currentTheme.value === Theme.DARK ? Theme.LIGHT : Theme.DARK
  }

  return { currentTheme, setTheme, toggleTheme }
}
