import 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    /**
     * 路由标题
     *
     * 可用于文档标题
     */
    title: string;
    /**
     * 路由的i18n键
     *
     * 用于国际化，如果设置，title将被忽略
     */
    i18nKey?: App.I18n.I18nKey | null;
    /**
     * 路由权限角色
     *
     * 当前用户拥有任意角色即可访问路由
     *
     * 只有在路由模式为"static"时生效，动态路由模式下会被忽略
     */
    roles?: string[];
    /** 是否缓存路由 */
    keepAlive?: boolean | null;
    /**
     * 是否为常量路由
     *
     * 设置为true时，访问该路由无需登录验证和权限验证
     */
    constant?: boolean | null;
    /**
     * Iconify图标
     *
     * 可用于菜单或面包屑
     */
    icon?: string;
    /**
     * 本地图标
     *
     * 位于"src/assets/svg-icon"，设置时优先使用本地图标
     */
    localIcon?: string;
    /** 图标大小（宽高相同） */
    iconFontSize?: number;
    /** 路由排序 */
    order?: number | null;
    /** 路由外链地址 */
    href?: string | null;
    /** 是否在菜单中隐藏路由 */
    hideInMenu?: boolean | null;
    /**
     * 进入路由时需要激活的菜单键
     *
     * 适用于路由不在菜单中显示的情况
     *
     * @example
     *   路由为"user_detail"，若设置为"user_list"，则会激活"user_list"菜单
     */
    activeMenu?: import('@elegant-router/types').RouteKey | null;
    /** 默认情况下，相同路径的路由会共用一个标签页，设置为true时，不同查询参数的路由会使用不同标签页 */
    multiTab?: boolean | null;
    /** 固定标签页的索引顺序 */
    fixedIndexInTab?: number | null;
    /** 进入路由时自动携带的查询参数 */
    query?: { key: string; value: string }[] | null;
  }
}
