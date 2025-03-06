/** 默认主题设置 定义了应用程序的主题、布局、样式等配置项 */
export const themeSettings: App.Theme.ThemeSetting = {
  /** 主题模式：light-亮色模式 */
  themeScheme: 'light',
  /** 灰度模式 */
  grayscale: false,
  /** 色弱模式 */
  colourWeakness: false,
  /** 推荐颜色 */
  recommendColor: false,
  /** 主题色 */
  themeColor: '#646cff',
  /** 其他功能色 */
  otherColor: {
    /** 信息色 */
    info: '#2080f0',
    /** 成功色 */
    success: '#52c41a',
    /** 警告色 */
    warning: '#faad14',
    /** 错误色 */
    error: '#f5222d'
  },
  /** 信息色是否跟随主题色 */
  isInfoFollowPrimary: true,
  /** 缓存重置策略 */
  resetCacheStrategy: 'close',
  /** 布局设置 */
  layout: {
    /** 布局模式：vertical-垂直 */
    mode: 'vertical',
    /** 滚动模式：content-内容区域滚动 */
    scrollMode: 'content',
    /** 水平混合模式反转 */
    reverseHorizontalMix: false
  },
  /** 页面设置 */
  page: {
    /** 页面切换动画开关 */
    animate: true,
    /** 页面动画模式：fade-slide-淡入滑动 */
    animateMode: 'fade-slide'
  },
  /** 头部设置 */
  header: {
    /** 头部高度 */
    height: 56,
    /** 面包屑设置 */
    breadcrumb: {
      /** 是否显示面包屑 */
      visible: true,
      /** 是否显示图标 */
      showIcon: true
    },
    /** 多语言设置 */
    multilingual: {
      /** 是否显示多语言切换 */
      visible: true
    }
  },
  /** 标签页设置 */
  tab: {
    /** 是否显示标签页 */
    visible: true,
    /** 是否缓存标签页 */
    cache: true,
    /** 标签页高度 */
    height: 44,
    /** 标签页模式：chrome-谷歌浏览器风格 */
    mode: 'chrome'
  },
  /** 是否固定头部和标签页 */
  fixedHeaderAndTab: true,
  /** 侧边栏设置 */
  sider: {
    /** 是否反转色调 */
    inverted: false,
    /** 展开宽度 */
    width: 220,
    /** 收缩宽度 */
    collapsedWidth: 64,
    /** 混合模式宽度 */
    mixWidth: 90,
    /** 混合模式收缩宽度 */
    mixCollapsedWidth: 64,
    /** 混合模式子菜单宽度 */
    mixChildMenuWidth: 200
  },
  /** 页脚设置 */
  footer: {
    /** 是否显示页脚 */
    visible: true,
    /** 是否固定页脚 */
    fixed: false,
    /** 页脚高度 */
    height: 48,
    /** 是否右对齐 */
    right: true
  },
  /** 水印设置 */
  watermark: {
    /** 是否显示水印 */
    visible: false,
    /** 水印文本 */
    text: 'SoybeanAdmin'
  },
  /** 主题令牌配置 */
  tokens: {
    /** 亮色主题配置 */
    light: {
      /** 颜色配置 */
      colors: {
        /** 容器背景色 */
        container: 'rgb(255, 255, 255)',
        /** 布局背景色 */
        layout: 'rgb(247, 250, 252)',
        /** 反转背景色 */
        inverted: 'rgb(0, 20, 40)',
        /** 基础文本色 */
        'base-text': 'rgb(31, 31, 31)'
      },
      /** 阴影配置 */
      boxShadow: {
        /** 头部阴影 */
        header: '0 1px 2px rgb(0, 21, 41, 0.08)',
        /** 侧边栏阴影 */
        sider: '2px 0 8px 0 rgb(29, 35, 41, 0.05)',
        /** 标签页阴影 */
        tab: '0 1px 2px rgb(0, 21, 41, 0.08)'
      }
    },
    /** 暗色主题配置 */
    dark: {
      /** 颜色配置 */
      colors: {
        /** 容器背景色 */
        container: 'rgb(28, 28, 28)',
        /** 布局背景色 */
        layout: 'rgb(18, 18, 18)',
        /** 基础文本色 */
        'base-text': 'rgb(224, 224, 224)'
      }
    }
  }
};

/**
 * 覆盖主题设置
 *
 * 用于在发布新版本时覆盖特定的主题设置 可以部分覆盖themeSettings中的配置
 */
export const overrideThemeSettings: Partial<App.Theme.ThemeSetting> = {};
