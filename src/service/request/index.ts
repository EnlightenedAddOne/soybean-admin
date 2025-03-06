import type { AxiosResponse } from 'axios';
import { BACKEND_ERROR_CODE, createFlatRequest, createRequest } from '@sa/axios';
import { useAuthStore } from '@/store/modules/auth';
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
      'Content-Type': 'application/json'
    },
    timeout: 30000 // 设置为30秒
  },
  {
    /** 请求拦截器：添加授权信息 */
    async onRequest(config) {
      const Authorization = getAuthorization();
      Object.assign(config.headers, { Authorization });

      return config;
    },
    /** 判断后端请求是否成功（FastAPI 默认返回数据结构） */
    isBackendSuccess(response) {
      // FastAPI 成功响应状态码为 2xx
      return response.status >= 200 && response.status < 300;
    },
    /** 处理后端请求失败的情况 包括：普通登出、弹窗登出、token过期等场景的处理 */
    async onBackendFail(response, instance) {
      const authStore = useAuthStore();

      // 处理401未授权的情况（token过期或无效）
      if (response.status === 401) {
        const success = await handleExpiredRequest(request.state);
        if (success) {
          const Authorization = getAuthorization();
          Object.assign(response.config.headers, { Authorization });
          return instance.request(response.config) as Promise<AxiosResponse>;
        }
        // 如果刷新token失败，则登出
        authStore.resetStore();
        return null;
      }

      return null;
    },
    /** 转换后端响应数据：FastAPI 直接返回数据 */
    transformBackendResponse(response) {
      return response.data;
    },
    /** 统一的错误处理 处理网络错误、后端错误等异常情况 */
    onError(error) {
      let message = error.message;

      if (error.code === BACKEND_ERROR_CODE) {
        // FastAPI 错误响应格式
        const errorData = error.response?.data as unknown as Api.FastAPIError;
        message = errorData?.detail || message;
      }

      // 401错误不显示错误消息（会在刷新token后重试）
      if (error.response?.status === 401) {
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
