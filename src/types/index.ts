/** 处理模式 */
export enum ProcessMode {
  /** 格式化（美化缩进） */
  FORMAT = 'format',
  /** 压缩（移除空格和换行） */
  COMPRESS = 'compress',
}

/** 主题 */
export enum Theme {
  DARK = 'dark',
  LIGHT = 'light',
}

/** JSON 处理结果 */
export interface JsonProcessResult {
  /** 处理后的 JSON 字符串 */
  content: string
  /** 是否处理成功 */
  success: boolean
  /** 错误信息（仅失败时） */
  error?: string
}
