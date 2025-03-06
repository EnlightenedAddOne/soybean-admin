import { useAuthStore } from '@/store/modules/auth';
import { localStg } from '@/utils/storage';
import { fetchRefreshToken } from '../api';
import type { RequestInstanceState } from './type';

/**
 * 获取授权头信息
 *
 * @returns 返回Bearer token格式的授权信息，如果没有token则返回null
 */
export function getAuthorization() {
  const token = localStg.get('token');
  const Authorization = token ? `Bearer ${token}` : null;

  return Authorization;
}

/**
 * 处理token刷新
 *
 * 1. 获取存储的刷新token
 * 2. 调用刷新token接口
 * 3. 更新存储的token信息
 * 4. 如果刷新失败，则重置状态并抛出错误
 */
export async function handleRefreshToken() {
  const { resetStore } = useAuthStore();

  const rToken = localStg.get('refreshToken') || '';
  const refreshTokenMethod = fetchRefreshToken(rToken);

  // 设置refreshToken角色，使请求不被拦截
  refreshTokenMethod.meta.authRole = 'refreshToken';

  try {
    const data = await refreshTokenMethod;
    localStg.set('token', data.token);
    localStg.set('refreshToken', data.refreshToken);
  } catch (error) {
    resetStore();
    throw error;
  }
}

/**
 * 显示错误消息
 *
 * 1. 初始化错误消息栈
 * 2. 检查消息是否已存在
 * 3. 如果消息不存在，则添加到栈中并显示
 * 4. 消息消失后从栈中移除
 *
 * @param state - 请求实例状态
 * @param message - 错误消息
 */
export function showErrorMsg(state: RequestInstanceState, message: string) {
  if (!state.errMsgStack?.length) {
    state.errMsgStack = [];
  }

  const isExist = state.errMsgStack.includes(message);

  if (!isExist) {
    state.errMsgStack.push(message);

    window.$message?.error(message, {
      onLeave: () => {
        state.errMsgStack = state.errMsgStack.filter(msg => msg !== message);

        setTimeout(() => {
          state.errMsgStack = [];
        }, 5000);
      }
    });
  }
}
