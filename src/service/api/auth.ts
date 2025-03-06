import { request } from '../request';

/**
 * 用户登录
 *
 * @param userName - 用户名
 * @param password - 密码
 * @returns 登录token信息
 */
export function fetchLogin(userName: string, password: string) {
  console.log('Sending login request:', { userName, password });
  return request<Api.Auth.LoginToken>({
    url: '/auth/login',
    method: 'post',
    data: { userName, password }
  });
}

/** 获取用户信息 */
export function fetchGetUserInfo() {
  return request<Api.Auth.UserInfo>({ url: '/auth/getUserInfo' });
}

/**
 * 刷新token
 *
 * @param refreshToken - 用于刷新的token
 * @returns 新的token信息
 */
export function fetchRefreshToken(refreshToken: string) {
  return request<Api.Auth.LoginToken>({
    url: '/auth/refreshToken',
    method: 'post',
    data: {
      refreshToken
    }
  });
}

/**
 * 返回自定义后端错误 用于测试错误处理机制
 *
 * @param code - 错误码
 * @param msg - 错误信息
 */
export function fetchCustomBackendError(code: string, msg: string) {
  return request({ url: '/auth/error', params: { code, msg } });
}
