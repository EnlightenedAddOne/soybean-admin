import type { GlobalThemeOverrides } from 'naive-ui';
import { defu } from 'defu';
import { addColorAlpha, getColorPalette, getPaletteColorByNumber, getRgb } from '@sa/color';
import { overrideThemeSettings, themeSettings } from '@/theme/settings';
import { themeVars } from '@/theme/vars';
import { toggleHtmlClass } from '@/utils/common';
import { localStg } from '@/utils/storage';

/** 暗黑模式的类名 */
const DARK_CLASS = 'dark';

/**
 * 初始化主题设置
 *
 * 1. 开发环境：直接使用主题配置，不做缓存
 * 2. 生产环境：优先使用本地缓存的主题配置
 * 3. 如需更新主题配置，可以通过更新 overrideThemeSettings 来实现
 */
export function initThemeSettings() {
  const isProd = import.meta.env.PROD;

  // 开发环境：直接使用主题配置文件中的设置
  if (!isProd) return themeSettings;

  // 生产环境：使用本地缓存的主题设置
  const localSettings = localStg.get('themeSettings');

  let settings = defu(localSettings, themeSettings);

  const isOverride = localStg.get('overrideThemeFlag') === BUILD_TIME;

  // 检查是否需要强制更新主题设置
  if (!isOverride) {
    settings = defu(overrideThemeSettings, settings);
    localStg.set('overrideThemeFlag', BUILD_TIME);
  }

  return settings;
}

/**
 * 根据主题设置创建主题令牌CSS变量
 *
 * @param colors - 主题颜色对象
 * @param tokens - 主题设置令牌
 * @param recommended - 是否使用推荐的颜色，默认为false
 */
export function createThemeToken(
  colors: App.Theme.ThemeColor,
  tokens?: App.Theme.ThemeSetting['tokens'],
  recommended = false
) {
  // 创建调色板颜色
  const paletteColors = createThemePaletteColors(colors, recommended);

  const { light, dark } = tokens || themeSettings.tokens;

  // 创建亮色主题令牌
  const themeTokens: App.Theme.ThemeTokenCSSVars = {
    colors: {
      ...paletteColors,
      nprogress: paletteColors.primary,
      ...light.colors
    },
    boxShadow: {
      ...light.boxShadow
    }
  };

  // 创建暗色主题令牌
  const darkThemeTokens: App.Theme.ThemeTokenCSSVars = {
    colors: {
      ...themeTokens.colors,
      ...dark?.colors
    },
    boxShadow: {
      ...themeTokens.boxShadow,
      ...dark?.boxShadow
    }
  };

  return {
    themeTokens,
    darkThemeTokens
  };
}

/**
 * 创建主题调色板颜色
 *
 * @param colors - 主题颜色对象
 * @param recommended - 是否使用推荐的颜色，默认为false
 */
function createThemePaletteColors(colors: App.Theme.ThemeColor, recommended = false) {
  const colorKeys = Object.keys(colors) as App.Theme.ThemeColorKey[];
  const colorPaletteVar = {} as App.Theme.ThemePaletteColor;

  // 为每个颜色生成调色板
  colorKeys.forEach(key => {
    const colorMap = getColorPalette(colors[key], recommended);

    colorPaletteVar[key] = colorMap.get(500)!;

    // 生成不同深浅度的颜色变量
    colorMap.forEach((hex, number) => {
      colorPaletteVar[`${key}-${number}`] = hex;
    });
  });

  return colorPaletteVar;
}

/**
 * 根据令牌获取CSS变量
 *
 * @param tokens - 主题基础令牌
 */
function getCssVarByTokens(tokens: App.Theme.BaseToken) {
  const styles: string[] = [];

  // 移除CSS变量前缀
  function removeVarPrefix(value: string) {
    return value.replace('var(', '').replace(')', '');
  }

  // 移除RGB前缀
  function removeRgbPrefix(value: string) {
    return value.replace('rgb(', '').replace(')', '');
  }

  // 遍历主题变量并生成CSS变量
  for (const [key, tokenValues] of Object.entries(themeVars)) {
    for (const [tokenKey, tokenValue] of Object.entries(tokenValues)) {
      let cssVarsKey = removeVarPrefix(tokenValue);
      let cssValue = tokens[key][tokenKey];

      if (key === 'colors') {
        cssVarsKey = removeRgbPrefix(cssVarsKey);
        const { r, g, b } = getRgb(cssValue);
        cssValue = `${r} ${g} ${b}`;
      }

      styles.push(`${cssVarsKey}: ${cssValue}`);
    }
  }

  const styleStr = styles.join(';');

  return styleStr;
}

/**
 * 将主题变量添加到全局样式中
 *
 * @param tokens - 亮色主题令牌
 * @param darkTokens - 暗色主题令牌
 */
export function addThemeVarsToGlobal(tokens: App.Theme.BaseToken, darkTokens: App.Theme.BaseToken) {
  const cssVarStr = getCssVarByTokens(tokens);
  const darkCssVarStr = getCssVarByTokens(darkTokens);

  // 生成亮色主题CSS
  const css = `
    :root {
      ${cssVarStr}
    }
  `;

  // 生成暗色主题CSS
  const darkCss = `
    html.${DARK_CLASS} {
      ${darkCssVarStr}
    }
  `;

  const styleId = 'theme-vars';

  // 创建或更新样式标签
  const style = document.querySelector(`#${styleId}`) || document.createElement('style');
  style.id = styleId;
  style.textContent = css + darkCss;
  document.head.appendChild(style);
}

/**
 * 切换CSS暗黑模式
 *
 * @param darkMode - 是否启用暗黑模式
 */
export function toggleCssDarkMode(darkMode = false) {
  const { add, remove } = toggleHtmlClass(DARK_CLASS);

  if (darkMode) {
    add();
  } else {
    remove();
  }
}

/**
 * 切换辅助色彩模式（灰度模式和色弱模式）
 *
 * @param grayscaleMode - 是否启用灰度模式
 * @param colourWeakness - 是否启用色弱模式
 */
export function toggleAuxiliaryColorModes(grayscaleMode = false, colourWeakness = false) {
  const htmlElement = document.documentElement;
  htmlElement.style.filter = [grayscaleMode ? 'grayscale(100%)' : '', colourWeakness ? 'invert(80%)' : '']
    .filter(Boolean)
    .join(' ');
}

/** Naive UI 颜色场景类型 */
type NaiveColorScene = '' | 'Suppl' | 'Hover' | 'Pressed' | 'Active';
/** Naive UI 颜色键类型 */
type NaiveColorKey = `${App.Theme.ThemeColorKey}Color${NaiveColorScene}`;
/** Naive UI 主题颜色类型 */
type NaiveThemeColor = Partial<Record<NaiveColorKey, string>>;
/** Naive UI 颜色动作接口 */
interface NaiveColorAction {
  scene: NaiveColorScene;
  handler: (color: string) => string;
}

/**
 * 获取 Naive UI 主题颜色
 *
 * @param colors - 主题颜色对象
 * @param recommended - 是否使用推荐的颜色，默认为false
 */
function getNaiveThemeColors(colors: App.Theme.ThemeColor, recommended = false) {
  // 定义颜色场景处理器
  const colorActions: NaiveColorAction[] = [
    { scene: '', handler: color => color },
    { scene: 'Suppl', handler: color => color },
    { scene: 'Hover', handler: color => getPaletteColorByNumber(color, 500, recommended) },
    { scene: 'Pressed', handler: color => getPaletteColorByNumber(color, 700, recommended) },
    { scene: 'Active', handler: color => addColorAlpha(color, 0.1) }
  ];

  const themeColors: NaiveThemeColor = {};

  const colorEntries = Object.entries(colors) as [App.Theme.ThemeColorKey, string][];

  // 生成各种场景的颜色
  colorEntries.forEach(color => {
    colorActions.forEach(action => {
      const [colorType, colorValue] = color;
      const colorKey: NaiveColorKey = `${colorType}Color${action.scene}`;
      themeColors[colorKey] = action.handler(colorValue);
    });
  });

  return themeColors;
}

/**
 * 获取 Naive UI 主题配置
 *
 * @param colors - 主题颜色对象
 * @param recommended - 是否使用推荐的颜色，默认为false
 */
export function getNaiveTheme(colors: App.Theme.ThemeColor, recommended = false) {
  const { primary: colorLoading } = colors;

  // 创建 Naive UI 主题覆盖配置
  const theme: GlobalThemeOverrides = {
    common: {
      ...getNaiveThemeColors(colors, recommended),
      borderRadius: '6px'
    },
    LoadingBar: {
      colorLoading
    },
    Tag: {
      borderRadius: '6px'
    }
  };

  return theme;
}
