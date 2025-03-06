/**
 * Env 命名空间
 *
 * 用于声明 import.meta 对象的类型
 */
declare namespace Env {
  /** 路由历史模式 */
  type RouterHistoryMode = 'hash' | 'history' | 'memory';

  /** import.meta 接口 */
  interface ImportMeta extends ImportMetaEnv {
    /** 应用基础地址 */
    readonly VITE_BASE_URL: string;
    /** 应用标题 */
    readonly VITE_APP_TITLE: string;
    /** 应用描述 */
    readonly VITE_APP_DESC: string;
    /** 路由历史模式 */
    readonly VITE_ROUTER_HISTORY_MODE?: RouterHistoryMode;
    /** Iconify 图标前缀 */
    readonly VITE_ICON_PREFIX: 'icon';
    /**
     * 本地图标前缀
     *
     * 该前缀需要以图标前缀开头
     */
    readonly VITE_ICON_LOCAL_PREFIX: 'local-icon';
    /** 后端服务基础地址 */
    readonly VITE_SERVICE_BASE_URL: string;
    /**
     * 后端服务成功码
     *
     * 当收到该code时，表示请求成功
     */
    readonly VITE_SERVICE_SUCCESS_CODE: string;
    /**
     * 后端服务登出码
     *
     * 当收到该code时，用户将被登出并重定向到登录页
     *
     * 使用逗号分隔多个code
     */
    readonly VITE_SERVICE_LOGOUT_CODES: string;
    /**
     * 后端服务模态框登出码
     *
     * 当收到该code时，将通过显示模态框的方式登出用户
     *
     * 使用逗号分隔多个code
     */
    readonly VITE_SERVICE_MODAL_LOGOUT_CODES: string;
    /**
     * 后端服务token过期码
     *
     * 当收到该code时，将刷新token并重新发送请求
     *
     * 使用逗号分隔多个code
     */
    readonly VITE_SERVICE_EXPIRED_TOKEN_CODES: string;
    /** 当路由模式为静态时，定义的超级角色 */
    readonly VITE_STATIC_SUPER_ROLE: string;
    /**
     * 其他后端服务基础地址
     *
     * 值为json格式
     */
    readonly VITE_OTHER_SERVICE_BASE_URL: string;
    /**
     * 是否启用http代理
     *
     * 仅在开发环境有效
     */
    readonly VITE_HTTP_PROXY?: CommonType.YesOrNo;
    /**
     * 权限路由模式
     *
     * - Static: 前端生成权限路由
     * - Dynamic: 后端生成权限路由
     */
    readonly VITE_AUTH_ROUTE_MODE: 'static' | 'dynamic';
    /**
     * 首页路由key
     *
     * 仅在静态路由模式下有效，动态路由模式的首页路由由后端定义
     */
    readonly VITE_ROUTE_HOME: import('@elegant-router/types').LastLevelRouteKey;
    /**
     * 菜单默认图标（当未设置菜单图标时使用）
     *
     * Iconify 图标名称
     */
    readonly VITE_MENU_ICON: string;
    /** 是否构建sourcemap */
    readonly VITE_SOURCE_MAP?: CommonType.YesOrNo;
    /**
     * Iconify API 服务地址
     *
     * 当项目部署在内网时，可设置为本地图标服务器地址
     *
     * @link https://docs.iconify.design/api/providers.html
     */
    readonly VITE_ICONIFY_URL?: string;
    /** 用于区分不同域的存储 */
    readonly VITE_STORAGE_PREFIX?: string;
    /** 配置应用打包后是否自动检测更新 */
    readonly VITE_AUTOMATICALLY_DETECT_UPDATE?: CommonType.YesOrNo;
  }
}

interface ImportMeta {
  readonly env: Env.ImportMeta;
}
