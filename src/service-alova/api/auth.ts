import { alova } from '../request';

/**
 * 用户登录
 *
 * @param userName - 用户名
 * @param password - 密码
 * @returns 登录token信息
 */
export function fetchLogin(userName: string, password: string) {
  return alova.Post<Api.Auth.LoginToken>('/auth/login', { userName, password });
}

/** 获取用户信息 */
export function fetchGetUserInfo() {
  return alova.Get<Api.Auth.UserInfo>('/auth/getUserInfo');
}

/**
 * 发送验证码到指定手机号
 *
 * @param phone - 手机号
 */
export function sendCaptcha(phone: string) {
  return alova.Post<null>('/auth/sendCaptcha', { phone });
}

/**
 * 验证验证码
 *
 * @param phone - 手机号
 * @param code - 验证码
 */
export function verifyCaptcha(phone: string, code: string) {
  return alova.Post<null>('/auth/verifyCaptcha', { phone, code });
}

/**
 * 刷新token
 *
 * @param refreshToken - 刷新token
 * @returns 新的token信息
 */
export function fetchRefreshToken(refreshToken: string) {
  return alova.Post<Api.Auth.LoginToken>(
    '/auth/refreshToken',
    { refreshToken },
    {
      meta: {
        authRole: 'refreshToken'
      }
    }
  );
}

/**
 * 返回自定义后端错误
 *
 * 用于测试错误处理机制
 *
 * @param code - 错误码
 * @param msg - 错误信息
 */
export function fetchCustomBackendError(code: string, msg: string) {
  return alova.Get('/auth/error', {
    params: { code, msg },
    shareRequest: false
  });
}
