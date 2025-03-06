import { transformRecordToOption } from '@/utils/common';

// 全局头部菜单ID
export const GLOBAL_HEADER_MENU_ID = '__GLOBAL_HEADER_MENU__';

// 全局侧边菜单ID
export const GLOBAL_SIDER_MENU_ID = '__GLOBAL_SIDER_MENU__';

// 主题方案记录
export const themeSchemaRecord: Record<UnionKey.ThemeScheme, App.I18n.I18nKey> = {
  light: 'theme.themeSchema.light',
  dark: 'theme.themeSchema.dark',
  auto: 'theme.themeSchema.auto'
};

// 主题方案选项
export const themeSchemaOptions = transformRecordToOption(themeSchemaRecord);

// 登录模块记录
export const loginModuleRecord: Record<UnionKey.LoginModule, App.I18n.I18nKey> = {
  'pwd-login': 'page.login.pwdLogin.title',
  'code-login': 'page.login.codeLogin.title',
  register: 'page.login.register.title',
  'reset-pwd': 'page.login.resetPwd.title',
  'bind-wechat': 'page.login.bindWeChat.title'
};

// 主题布局模式记录
export const themeLayoutModeRecord: Record<UnionKey.ThemeLayoutMode, App.I18n.I18nKey> = {
  vertical: 'theme.layoutMode.vertical',
  'vertical-mix': 'theme.layoutMode.vertical-mix',
  horizontal: 'theme.layoutMode.horizontal',
  'horizontal-mix': 'theme.layoutMode.horizontal-mix'
};

// 主题布局模式选项
export const themeLayoutModeOptions = transformRecordToOption(themeLayoutModeRecord);

// 主题滚动模式记录
export const themeScrollModeRecord: Record<UnionKey.ThemeScrollMode, App.I18n.I18nKey> = {
  wrapper: 'theme.scrollMode.wrapper',
  content: 'theme.scrollMode.content'
};

// 主题滚动模式选项
export const themeScrollModeOptions = transformRecordToOption(themeScrollModeRecord);

// 主题标签模式记录
export const themeTabModeRecord: Record<UnionKey.ThemeTabMode, App.I18n.I18nKey> = {
  chrome: 'theme.tab.mode.chrome',
  button: 'theme.tab.mode.button'
};

// 主题标签模式选项
export const themeTabModeOptions = transformRecordToOption(themeTabModeRecord);

// 主题页面动画模式记录
export const themePageAnimationModeRecord: Record<UnionKey.ThemePageAnimateMode, App.I18n.I18nKey> = {
  'fade-slide': 'theme.page.mode.fade-slide',
  fade: 'theme.page.mode.fade',
  'fade-bottom': 'theme.page.mode.fade-bottom',
  'fade-scale': 'theme.page.mode.fade-scale',
  'zoom-fade': 'theme.page.mode.zoom-fade',
  'zoom-out': 'theme.page.mode.zoom-out',
  none: 'theme.page.mode.none'
};

// 主题页面动画模式选项
export const themePageAnimationModeOptions = transformRecordToOption(themePageAnimationModeRecord);

// 重置缓存策略记录
export const resetCacheStrategyRecord: Record<UnionKey.ResetCacheStrategy, App.I18n.I18nKey> = {
  close: 'theme.resetCacheStrategy.close',
  refresh: 'theme.resetCacheStrategy.refresh'
};

// 重置缓存策略选项
export const resetCacheStrategyOptions = transformRecordToOption(resetCacheStrategyRecord);
