/** 请求实例的状态接口 */
export interface RequestInstanceState {
  /** 是否正在刷新token的标志 */
  refreshTokenFn: Promise<boolean> | null;
  /** 请求错误消息栈，用于存储和管理错误提示 */
  errMsgStack: string[];
}
