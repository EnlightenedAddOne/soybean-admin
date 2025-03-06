/**
 * 获取本地SVG图标
 *
 * 该函数用于获取 /src/assets/svg-icon/ 目录下的所有SVG图标文件名 使用Vite的import.meta.glob动态导入功能
 *
 * @returns {string[]} 返回所有SVG图标的文件名数组（不包含.svg后缀）
 */
export function getLocalIcons() {
  // 使用Vite的glob导入获取所有SVG文件
  const svgIcons = import.meta.glob('/src/assets/svg-icon/*.svg');

  // 处理文件路径，提取文件名并移除.svg后缀
  const keys = Object.keys(svgIcons)
    .map(item => item.split('/').at(-1)?.replace('.svg', '') || '')
    .filter(Boolean);

  return keys;
}
