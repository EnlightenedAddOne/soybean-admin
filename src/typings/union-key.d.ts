/** 联合键命名空间 */
declare namespace UnionKey {
  /**
   * 登录模块
   *
   * - pwd-login: 密码登录
   * - code-login: 手机验证码登录
   * - register: 注册
   * - reset-pwd: 重置密码
   * - bind-wechat: 绑定微信
   */
  type LoginModule = 'pwd-login' | 'code-login' | 'register' | 'reset-pwd' | 'bind-wechat';

  /** 主题方案 */
  type ThemeScheme = 'light' | 'dark' | 'auto';

  /**
   * 重置缓存策略
   *
   * - close: 关闭页面时重新缓存
   * - refresh: 刷新页面时重新缓存
   */
  type ResetCacheStrategy = 'close' | 'refresh';

  /**
   * 布局模式
   *
   * - vertical: 左侧垂直菜单
   * - horizontal: 顶部水平菜单
   * - vertical-mix: 左侧两个垂直混合菜单
   * - horizontal-mix: 左侧垂直一级菜单和顶部水平子级菜单
   */
  type ThemeLayoutMode = 'vertical' | 'horizontal' | 'vertical-mix' | 'horizontal-mix';

  /**
   * 内容溢出时的滚动模式
   *
   * - wrapper: wrapper组件的根元素溢出
   * - content: content组件溢出
   */
  type ThemeScrollMode = import('@sa/materials').LayoutScrollMode;

  /** 页面动画模式 */
  type ThemePageAnimateMode = 'fade' | 'fade-slide' | 'fade-bottom' | 'fade-scale' | 'zoom-fade' | 'zoom-out' | 'none';

  /**
   * 标签页模式
   *
   * - chrome: Chrome风格
   * - button: 按钮风格
   */
  type ThemeTabMode = import('@sa/materials').PageTabMode;

  /** Unocss动画键 */
  type UnoCssAnimateKey =
    | 'pulse'
    | 'bounce'
    | 'spin'
    | 'ping'
    | 'bounce-alt'
    | 'flash'
    | 'pulse-alt'
    | 'rubber-band'
    | 'shake-x'
    | 'shake-y'
    | 'head-shake'
    | 'swing'
    | 'tada'
    | 'wobble'
    | 'jello'
    | 'heart-beat'
    | 'hinge'
    | 'jack-in-the-box'
    | 'light-speed-in-left'
    | 'light-speed-in-right'
    | 'light-speed-out-left'
    | 'light-speed-out-right'
    | 'flip'
    | 'flip-in-x'
    | 'flip-in-y'
    | 'flip-out-x'
    | 'flip-out-y'
    | 'rotate-in'
    | 'rotate-in-down-left'
    | 'rotate-in-down-right'
    | 'rotate-in-up-left'
    | 'rotate-in-up-right'
    | 'rotate-out'
    | 'rotate-out-down-left'
    | 'rotate-out-down-right'
    | 'rotate-out-up-left'
    | 'rotate-out-up-right'
    | 'roll-in'
    | 'roll-out'
    | 'zoom-in'
    | 'zoom-in-down'
    | 'zoom-in-left'
    | 'zoom-in-right'
    | 'zoom-in-up'
    | 'zoom-out'
    | 'zoom-out-down'
    | 'zoom-out-left'
    | 'zoom-out-right'
    | 'zoom-out-up'
    | 'bounce-in'
    | 'bounce-in-down'
    | 'bounce-in-left'
    | 'bounce-in-right'
    | 'bounce-in-up'
    | 'bounce-out'
    | 'bounce-out-down'
    | 'bounce-out-left'
    | 'bounce-out-right'
    | 'bounce-out-up'
    | 'slide-in-down'
    | 'slide-in-left'
    | 'slide-in-right'
    | 'slide-in-up'
    | 'slide-out-down'
    | 'slide-out-left'
    | 'slide-out-right'
    | 'slide-out-up'
    | 'fade-in'
    | 'fade-in-down'
    | 'fade-in-down-big'
    | 'fade-in-left'
    | 'fade-in-left-big'
    | 'fade-in-right'
    | 'fade-in-right-big'
    | 'fade-in-up'
    | 'fade-in-up-big'
    | 'fade-in-top-left'
    | 'fade-in-top-right'
    | 'fade-in-bottom-left'
    | 'fade-in-bottom-right'
    | 'fade-out'
    | 'fade-out-down'
    | 'fade-out-down-big'
    | 'fade-out-left'
    | 'fade-out-left-big'
    | 'fade-out-right'
    | 'fade-out-right-big'
    | 'fade-out-up'
    | 'fade-out-up-big'
    | 'fade-out-top-left'
    | 'fade-out-top-right'
    | 'fade-out-bottom-left'
    | 'fade-out-bottom-right'
    | 'back-in-up'
    | 'back-in-down'
    | 'back-in-right'
    | 'back-in-left'
    | 'back-out-up'
    | 'back-out-down'
    | 'back-out-right'
    | 'back-out-left';
}
