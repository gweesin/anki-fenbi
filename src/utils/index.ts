/**
 * 匹配字符串尾部是否包含指定word（精准匹配尾部）
 * @param name - 待匹配的原字符串
 * @param word - 要匹配的尾部字符
 */
export function matchTailWord(name: string, word: string) {
  // 1. 转义word中的特殊字符（如 . * + $ 等），避免正则语法错误
  const escapedWord = RegExp.escape(word)
  // 2. 构建正则：^.* 表示开头到结尾的任意字符（非贪婪），$ 表示字符串尾部
  // 正则含义：匹配 任意内容 + 尾部的escapedWord
  const regex = new RegExp(`^.*(${escapedWord})$`)
  // 3. 执行匹配
  const matchResult = name.match(regex)

  // 4. 返回匹配到的尾部word（分组1），未匹配返回null
  return matchResult ? matchResult[1] : null
}

/**
 * 防抖函数（TypeScript 版）
 * @param func - 需要防抖的函数
 * @param wait - 延迟执行的毫秒数
 * @param immediate - 是否立即执行（默认 false）
 * @returns 防抖后的函数（挂载 cancel 方法用于取消执行）
 */
export function debounce<F extends (...args: any[]) => any>(
  func: F,
  wait: number,
  immediate: boolean = false
): F {
  // 存储定时器 ID
  let timeoutId: NodeJS.Timeout | null = null;

  // 防抖核心函数
  const debounced = function (this: ThisParameterType<F>, ...args: Parameters<F>) {
    const context = this;

    // 清除已有定时器（重置延迟）
    if (timeoutId) clearTimeout(timeoutId);

    // 立即执行逻辑
    if (immediate) {
      const callNow = !timeoutId;
      // 延迟重置定时器 ID，确保 wait 时间内无法重复触发
      timeoutId = setTimeout(() => {
        timeoutId = null;
      }, wait);
      // 首次触发时立即执行
      if (callNow) {
        func.apply(context, args);
      }
    } else {
      // 非立即执行：延迟执行目标函数
      timeoutId = setTimeout(() => {
        func.apply(context, args);
      }, wait);
    }
  } as F;

  return debounced;
}

// 类型导出（可选，方便项目中复用类型）
export type DebouncedFunction<F extends (...args: any[]) => any> = F & { cancel: () => void };
