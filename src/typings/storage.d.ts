/** 存储命名空间 */
declare namespace StorageType {
  interface Session {
    /** 主题颜色 */
    themeColor: string;
    // /**
    //  * 主题设置
    //  */
    // themeSettings: App.Theme.ThemeSetting;
  }

  interface Local {
    /** 国际化语言 */
    lang: App.I18n.LangType;
    /** 令牌 */
    token: string;
    /** 固定混合菜单的侧边栏 */
    mixSiderFixed: CommonType.YesOrNo;
    /** 刷新令牌 */
    refreshToken: string;
    /** 主题颜色 */
    themeColor: string;
    /** 主题设置 */
    themeSettings: App.Theme.ThemeSetting;
    /**
     * 覆盖主题标志
     *
     * 该值为项目的构建时间
     */
    overrideThemeFlag: string;
    /** 全局标签页 */
    globalTabs: App.Global.Tab[];
    /** 移动端之前的备份主题设置 */
    backupThemeSettingBeforeIsMobile: {
      layout: UnionKey.ThemeLayoutMode;
      siderCollapse: boolean;
    };
  }
}
