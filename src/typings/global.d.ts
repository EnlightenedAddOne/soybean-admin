export {};

declare global {
  export interface Window {
    /** NProgress实例 */
    NProgress?: import('nprogress').NProgress;
    /** 加载条实例 */
    $loadingBar?: import('naive-ui').LoadingBarProviderInst;
    /** 对话框实例 */
    $dialog?: import('naive-ui').DialogProviderInst;
    /** 消息实例 */
    $message?: import('naive-ui').MessageProviderInst;
    /** 通知实例 */
    $notification?: import('naive-ui').NotificationProviderInst;
  }

  /** 项目构建时间 */
  export const BUILD_TIME: string;
}
