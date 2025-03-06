import { createAlovaRequest } from '@sa/alova';
import { createAlovaMockAdapter } from '@sa/alova/mock';
import adapterFetch from '@sa/alova/fetch';
import { useAuthStore } from '@/store/modules/auth';
import { $t } from '@/locales';
import { getServiceBaseURL } from '@/utils/service';
import featureUsers20241014 from '../mocks/feature-users-20241014';
import { getAuthorization, handleRefreshToken, showErrorMsg } from './shared';
import type { RequestInstanceState } from './type';

// 是否启用HTTP代理（仅在开发环境且配置启用时生效）
const isHttpProxy = import.meta.env.DEV && import.meta.env.VITE_HTTP_PROXY === 'Y';
const { baseURL } = getServiceBaseURL(import.meta.env, isHttpProxy);

// 请求实例状态
const state: RequestInstanceState = {
  errMsgStack: []
};

/**
 * Mock适配器配置
 *
 * 1. 使用fetch作为后备请求适配器
 * 2. 设置响应延迟时间
 * 3. 启用全局mock
 * 4. 使用方法+URL的匹配模式
 */
const mockAdapter = createAlovaMockAdapter([featureUsers20241014], {
  // 当请求不匹配mock时使用fetch适配器
  httpAdapter: adapterFetch(),

  // 响应延迟时间
  delay: 1000,

  // 全局mock开关
  enable: true,
  matchMode: 'methodurl'
});

/**
 * 创建Alova请求实例
 *
 * 配置项包括：
 *
 * 1. 基础URL和请求适配器
 * 2. 请求拦截器（添加认证信息）
 * 3. Token刷新机制
 * 4. 响应成功判断
 * 5. 响应数据转换
 * 6. 错误处理
 */
export const alova = createAlovaRequest(
  {
    baseURL,
    // 开发环境使用mock适配器，生产环境使用fetch适配器
    requestAdapter: import.meta.env.DEV ? mockAdapter : adapterFetch()
  },
  {
    // 请求拦截器：添加认证信息
    onRequest({ config }) {
      const Authorization = getAuthorization();
      config.headers.Authorization = Authorization;
      config.headers.apifoxToken = 'XL299LiMEDZ0H5h3A29PxwQXdMJqWyY2';
    },
    // Token刷新配置
    tokenRefresher: {
      // 判断token是否过期
      async isExpired(response) {
        const expiredTokenCodes = import.meta.env.VITE_SERVICE_EXPIRED_TOKEN_CODES?.split(',') || [];
        const { code } = await response.clone().json();
        return expiredTokenCodes.includes(String(code));
      },
      // 处理token刷新
      async handler() {
        await handleRefreshToken();
      }
    },
    // 判断后端响应是否成功
    async isBackendSuccess(response) {
      // 当后端响应码为"0000"（默认）时表示请求成功
      // 可以通过修改.env文件中的VITE_SERVICE_SUCCESS_CODE来更改此逻辑
      const resp = response.clone();
      const data = await resp.json();
      return String(data.code) === import.meta.env.VITE_SERVICE_SUCCESS_CODE;
    },
    // 转换后端响应数据
    async transformBackendResponse(response) {
      return (await response.clone().json()).data;
    },
    // 错误处理
    async onError(error, response) {
      const authStore = useAuthStore();

      let message = error.message;
      let responseCode = '';
      if (response) {
        const data = await response?.clone().json();
        message = data.msg;
        responseCode = String(data.code);
      }

      // 处理登出逻辑
      function handleLogout() {
        showErrorMsg(state, message);
        authStore.resetStore();
      }

      // 登出并清理事件监听
      function logoutAndCleanup() {
        handleLogout();
        window.removeEventListener('beforeunload', handleLogout);
        state.errMsgStack = state.errMsgStack.filter(msg => msg !== message);
      }

      // 当后端响应码在logoutCodes中时，用户将被登出并重定向到登录页面
      const logoutCodes = import.meta.env.VITE_SERVICE_LOGOUT_CODES?.split(',') || [];
      if (logoutCodes.includes(responseCode)) {
        handleLogout();
        throw error;
      }

      // 当后端响应码在modalLogoutCodes中时，将通过显示模态框来登出用户
      const modalLogoutCodes = import.meta.env.VITE_SERVICE_MODAL_LOGOUT_CODES?.split(',') || [];
      if (modalLogoutCodes.includes(responseCode) && !state.errMsgStack?.includes(message)) {
        state.errMsgStack = [...(state.errMsgStack || []), message];

        // 防止用户刷新页面
        window.addEventListener('beforeunload', handleLogout);

        window.$dialog?.error({
          title: $t('common.error'),
          content: message,
          positiveText: $t('common.confirm'),
          maskClosable: false,
          closeOnEsc: false,
          onPositiveClick() {
            logoutAndCleanup();
          },
          onClose() {
            logoutAndCleanup();
          }
        });
        throw error;
      }
      showErrorMsg(state, message);
      throw error;
    }
  }
);
