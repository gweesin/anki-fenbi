import { flow } from 'es-toolkit'
import { SolutionData } from '../types'
import { replacementRules } from '../options/utils'

/**
 * 将包含p标签的字符串按p标签切割为数组（仅保留p标签内的内容）
 */
function splitByPTag(str: string) {
  if (str.trim() === '') {
    return [];
  }

  // 正则匹配所有<p>标签内容，[\s\S]匹配任意字符（包括换行），*?非贪婪匹配
  const pTagRegex = /<p.*?>([\s\S]*?)<\/p>/g;
  const result = [];
  let match;

  // 循环提取所有匹配的p标签内容
  while ((match = pTagRegex.exec(str)) !== null) {
    // match[1] 是<p>标签内的内容，trim去除首尾空白
    const content = match[1].trim();
    // 过滤空内容
    if (content) {
      result.push(content);
    }
  }

  return result;
}

/**
 * 将字符串中的p标签转换为br换行
 */
function convertPTagsToBr(html: string) {
  // 使用正则表达式替换p标签
  // 1 先替换</p><p>为<br>
  // 2 再移除剩余的<p>和</p>标签
  // 3 移除结束的p标签
  return html
    .replace(/<\/p>\s*<p>/g, '<br>')  // 替换段落之间的标签为br
    .replace(/<p>/g, '')             // 移除开始的p标签
    .replace(/<\/p>/g, '');
}

function mergeRemark(contents: string[]) {
  if(contents.length === 1) {
    return contents[0];
  }

  let result = ''; // 最终拼接的HTML字符串
  let currentList: string[] = []; // 暂存当前步骤下的列表项

  contents.forEach(item => {
    // 判断当前行是否是“第X步”开头
    if (/^第[\u4e00-\u9fa5\d]+步：/.test(item) || /^第[\u4e00-\u9fa5\d]+空：/.test(item) || item.startsWith('【文段出处】') || item.startsWith('逐一代入选项')) {
      // 如果暂存列表有内容，先渲染并拼接
      if (currentList.length > 0) {
        result += `<ul>${currentList.map(li => `<li>${li}</li>`).join('')}</ul>`;
        currentList = []; // 清空暂存
      }
      // 拼接“第X步”的行（可根据需要加<br>，或调整格式）
      result += `${item}<br>`;
      return;
    }

    // 非步骤行，加入暂存列表
    currentList.push(item);
  });

  // 处理最后一批暂存的列表项（避免末尾内容丢失）
  if (currentList.length > 0) {
    result += `<ul>${currentList.map(li => `<li>${li}</li>`).join('')}</ul>`;
  }

  return result;
}

function formatEllipsis(data: SolutionData) {
  data.content = data.content.replace('······', '……');
  data.solution = data.solution.replace('······', '……');
  return data;
}

function formatAnalysis(data: SolutionData) {
  // split as array
  const remarks = splitByPTag(data.solution)
    .filter(text => !text.includes('故正确答案为') && !/本题考查.*。/.test(text) && !/故.*表述正确，有.*项/.test(text))
    .map((text) => {
      const regex = /([ABCD])项/g;
      let result = text.replace(regex, '<br><b>$1</b>项').replace(/^<br>/, '');

      // 对匹配到的序列，替换内部每个字母
      result = result.replace(/[A-D](、[A-D])+/g, (match) => {
        // 对序列中的每个字母单独包裹 <b>
        return match.replace(/[A-D]/g, '<b>$&</b>');
      });

      result = result.replace(/。”?故/g, (match) => {
        // 找到“故”字的位置，在其前面插入<br>
        return match.replace('故', '<br>故');
      });


      return result;
    });

  // merge as string
  data.solution = mergeRemark(remarks);
  return data;
}

function formatTitle(data: SolutionData) {
  data.content = convertPTagsToBr(data.content)
  data.content = replaceUnderlineSpacesRegex(data.content);
  return data;
}

/**
 * TODO 识别填空题才生效
 * 使用正则表达式将<u>标签里的&nbsp;换成_，并去除u标签
 * @param {string} html - 包含HTML内容的字符串
 * @returns {string} - 处理后的字符串
 */
function replaceUnderlineSpacesRegex(html: string) {
  return html;
  // return html.replace(/<u>([^<]*)<\/u>/g, (_, content) => {
  //   return content.replace(/&nbsp;/g, '_').replace(/ /g, '_').replace(/ /g, '_');
  // }).replace('__', '_');
}

function formatSource(data: SolutionData) {
  replacementRules.forEach((item) => {
    const msg = typeof item === 'object' ? item.msg : item;
    const replaced = typeof item === 'object' ? item.replaced : ' ';

    if (data.source.includes(msg)) {
      data.source = data.source.replace(msg, replaced);
    }
  });

  data.source = data.source.replace(/ +/, ' ')

  return data;
}

export const formatSolution = flow(formatEllipsis, formatAnalysis, formatTitle, formatSource);
