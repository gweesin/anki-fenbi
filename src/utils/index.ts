function escapeRegExp(str: string): string {
  // 转义所有正则特殊字符: [ ] { } ( ) * + ? . \ ^ $ |
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 匹配字符串尾部是否包含指定word（精准匹配尾部）
 * @param name - 待匹配的原字符串
 * @param word - 要匹配的尾部字符
 */
export function matchTailWord(name: string, word: string) {
  // 1. 转义word中的特殊字符（如 . * + $ 等），避免正则语法错误
  const escapedWord = escapeRegExp(word)
  // 2. 构建正则：^.* 表示开头到结尾的任意字符（非贪婪），$ 表示字符串尾部
  // 正则含义：匹配 任意内容 + 尾部的escapedWord
  const regex = new RegExp(`^.*(${escapedWord})$`)
  // 3. 执行匹配
  const matchResult = name.match(regex)

  // 4. 返回匹配到的尾部word（分组1），未匹配返回null
  return matchResult ? matchResult[1] : null
}
