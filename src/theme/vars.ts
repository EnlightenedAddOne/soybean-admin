/** 创建颜色调色板变量 生成主题色、信息色、成功色、警告色、错误色的不同色阶变量 */
function createColorPaletteVars() {
  /** 基础颜色类型数组 */
  const colors: App.Theme.ThemeColorKey[] = ['primary', 'info', 'success', 'warning', 'error'];
  /** 色阶数值数组，用于生成不同深浅的颜色变体 */
  const colorPaletteNumbers: App.Theme.ColorPaletteNumber[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

  /** 调色板变量对象 */
  const colorPaletteVar = {} as App.Theme.ThemePaletteColor;

  // 遍历生成每个基础颜色的不同色阶变量
  colors.forEach(color => {
    /** 设置基础颜色变量 */
    colorPaletteVar[color] = `rgb(var(--${color}-color))`;
    /** 设置不同色阶的颜色变量 */
    colorPaletteNumbers.forEach(number => {
      colorPaletteVar[`${color}-${number}`] = `rgb(var(--${color}-${number}-color))`;
    });
  });

  return colorPaletteVar;
}

/** 生成调色板变量 */
const colorPaletteVars = createColorPaletteVars();

/** 主题变量 定义了主题相关的CSS变量，包括颜色和阴影效果 */
export const themeVars: App.Theme.ThemeTokenCSSVars = {
  /** 颜色变量 */
  colors: {
    ...colorPaletteVars,
    /** 进度条颜色 */
    nprogress: 'rgb(var(--nprogress-color))',
    /** 容器背景色 */
    container: 'rgb(var(--container-bg-color))',
    /** 布局背景色 */
    layout: 'rgb(var(--layout-bg-color))',
    /** 反转背景色 */
    inverted: 'rgb(var(--inverted-bg-color))',
    /** 基础文本色 */
    'base-text': 'rgb(var(--base-text-color))'
  },
  /** 阴影变量 */
  boxShadow: {
    /** 头部阴影 */
    header: 'var(--header-box-shadow)',
    /** 侧边栏阴影 */
    sider: 'var(--sider-box-shadow)',
    /** 标签页阴影 */
    tab: 'var(--tab-box-shadow)'
  }
};
