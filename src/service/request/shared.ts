import { useAuthStore } from '@/store/modules/auth';
import { localStg } from '@/utils/storage';
import { fetchRefreshToken } from '../api';
import type { RequestInstanceState } from './type';

/**
 * 获取授权头信息
 *
 * @returns 返回Bearer token格式的授权字符串，如果没有token则返回null
 */
export function getAuthorization() {
  const token = localStg.get('token');
  const Authorization = token ? `Bearer ${token}` : null;

  return Authorization;
}

/**
 * 处理token刷新
 *
 * 通过refreshToken获取新的token，成功则更新存储并返回true，失败则重置状态并返回false
 *
 * @returns 刷新是否成功
 */
async function handleRefreshToken() {
  const { resetStore } = useAuthStore();

  const rToken = localStg.get('refreshToken') || '';
  const { error, data } = await fetchRefreshToken(rToken);
  if (!error) {
    localStg.set('token', data.token);
    localStg.set('refreshToken', data.refreshToken);
    return true;
  }

  resetStore();

  return false;
}

/**
 * 处理token过期的请求
 *
 * 确保同一时间只有一个刷新token的请求，处理完成后清理状态
 *
 * @param state - 请求实例状态
 * @returns 处理是否成功
 */
export async function handleExpiredRequest(state: RequestInstanceState) {
  if (!state.refreshTokenFn) {
    state.refreshTokenFn = handleRefreshToken();
  }

  const success = await state.refreshTokenFn;

  setTimeout(() => {
    state.refreshTokenFn = null;
  }, 1000);

  return success;
}

/**
 * 显示错误消息
 *
 * 防止同一错误消息重复显示，并在消息消失后清理消息栈
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
