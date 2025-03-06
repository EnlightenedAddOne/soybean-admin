import type { AxiosResponse } from 'axios';
import { BACKEND_ERROR_CODE, createFlatRequest, createRequest } from '@sa/axios';
import { useAuthStore } from '@/store/modules/auth';
import { $t } from '@/locales';
import { localStg } from '@/utils/storage';
import { getServiceBaseURL } from '@/utils/service';
import { getAuthorization, handleExpiredRequest, showErrorMsg } from './shared';
import type { RequestInstanceState } from './type';

/** 是否启用HTTP代理（仅在开发环境且配置为Y时启用） */
const isHttpProxy = import.meta.env.DEV && import.meta.env.VITE_HTTP_PROXY === 'Y';
const { baseURL, otherBaseURL } = getServiceBaseURL(import.meta.env, isHttpProxy);

/** 主请求实例：用于处理主要的业务请求，包含完整的请求拦截、响应拦截和错误处理机制 */
export const request = createFlatRequest<App.Service.Response, RequestInstanceState>(
  {
    baseURL,
    headers: {
      apifoxToken: 'XL299LiMEDZ0H5h3A29PxwQXdMJqWyY2'
    }
  },
  {
    /** 请求拦截器：添加授权信息 */
    async onRequest(config) {
      const Authorization = getAuthorization();
      Object.assign(config.headers, { Authorization });

      return config;
    },
    /** 判断后端请求是否成功（以code为'0000'为判断标准，可通过.env文件的VITE_SERVICE_SUCCESS_CODE修改） */
    isBackendSuccess(response) {
      return String(response.data.code) === import.meta.env.VITE_SERVICE_SUCCESS_CODE;
    },
    /** 处理后端请求失败的情况 包括：普通登出、弹窗登出、token过期等场景的处理 */
    async onBackendFail(response, instance) {
      const authStore = useAuthStore();
      const responseCode = String(response.data.code);

      /** 处理登出操作：重置存储状态 */
      function handleLogout() {
        authStore.resetStore();
      }

      /** 登出并清理：移除事件监听，清理错误消息 */
      function logoutAndCleanup() {
        handleLogout();
        window.removeEventListener('beforeunload', handleLogout);
        request.state.errMsgStack = request.state.errMsgStack.filter(msg => msg !== response.data.msg);
      }

      // 处理普通登出场景：直接登出并跳转到登录页
      const logoutCodes = import.meta.env.VITE_SERVICE_LOGOUT_CODES?.split(',') || [];
      if (logoutCodes.includes(responseCode)) {
        handleLogout();
        return null;
      }

      // 处理需要显示弹窗的登出场景
      const modalLogoutCodes = import.meta.env.VITE_SERVICE_MODAL_LOGOUT_CODES?.split(',') || [];
      if (modalLogoutCodes.includes(responseCode) && !request.state.errMsgStack?.includes(response.data.msg)) {
        request.state.errMsgStack = [...(request.state.errMsgStack || []), response.data.msg];

        // 添加页面刷新前的登出处理
        window.addEventListener('beforeunload', handleLogout);

        window.$dialog?.error({
          title: $t('common.error'),
          content: response.data.msg,
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

        return null;
      }

      // 处理token过期场景：尝试刷新token并重试请求
      // 注意：refreshToken接口不能返回过期码，否则会导致死循环，应该返回登出码
      const expiredTokenCodes = import.meta.env.VITE_SERVICE_EXPIRED_TOKEN_CODES?.split(',') || [];
      if (expiredTokenCodes.includes(responseCode)) {
        const success = await handleExpiredRequest(request.state);
        if (success) {
          const Authorization = getAuthorization();
          Object.assign(response.config.headers, { Authorization });

          return instance.request(response.config) as Promise<AxiosResponse>;
        }
      }

      return null;
    },
    /** 转换后端响应数据：提取data字段 */
    transformBackendResponse(response) {
      return response.data.data;
    },
    /** 统一的错误处理 处理网络错误、后端错误等异常情况 */
    onError(error) {
      let message = error.message;
      let backendErrorCode = '';

      // 获取后端错误信息和代码
      if (error.code === BACKEND_ERROR_CODE) {
        message = error.response?.data?.msg || message;
        backendErrorCode = String(error.response?.data?.code || '');
      }

      // 弹窗登出场景不显示错误消息
      const modalLogoutCodes = import.meta.env.VITE_SERVICE_MODAL_LOGOUT_CODES?.split(',') || [];
      if (modalLogoutCodes.includes(backendErrorCode)) {
        return;
      }

      // token过期场景不显示错误消息（会在刷新token后重试）
      const expiredTokenCodes = import.meta.env.VITE_SERVICE_EXPIRED_TOKEN_CODES?.split(',') || [];
      if (expiredTokenCodes.includes(backendErrorCode)) {
        return;
      }

      showErrorMsg(request.state, message);
    }
  }
);

/** 示例请求实例：用于处理其他场景的请求，具有简化的请求处理机制 */
export const demoRequest = createRequest<App.Service.DemoResponse>(
  {
    baseURL: otherBaseURL.demo
  },
  {
    /** 请求拦截器：添加token认证信息 */
    async onRequest(config) {
      const { headers } = config;
      const token = localStg.get('token');
      const Authorization = token ? `Bearer ${token}` : null;
      Object.assign(headers, { Authorization });

      return config;
    },
    /** 判断后端请求是否成功（以status为'200'为判断标准） */
    isBackendSuccess(response) {
      return response.data.status === '200';
    },
    /** 处理后端请求失败的情况（如token过期等） */
    async onBackendFail(_response) {
      // 可以在这里处理token过期等场景
    },
    /** 转换后端响应数据：提取result字段 */
    transformBackendResponse(response) {
      return response.data.result;
    },
    /** 统一的错误处理：显示后端错误信息 */
    onError(error) {
      let message = error.message;

      if (error.code === BACKEND_ERROR_CODE) {
        message = error.response?.data?.message || message;
      }

      window.$message?.error(message);
    }
  }
);
