import type { ProxyOptions } from 'vite';
import { createServiceConfig } from '../../src/utils/service';

/**
 * 设置HTTP代理
 *
 * @param env - 当前环境变量
 * @param enable - 是否启用HTTP代理
 * @returns 代理配置对象或undefined
 */
export function createViteProxy(env: Env.ImportMeta, enable: boolean) {
  const isEnableHttpProxy = enable && env.VITE_HTTP_PROXY === 'Y'; // 判断是否启用HTTP代理

  if (!isEnableHttpProxy) return undefined;

  const { baseURL, proxyPattern, other } = createServiceConfig(env);

  // 创建代理配置
  const proxy: Record<string, ProxyOptions> = createProxyItem({ baseURL, proxyPattern });

  // 合并其他代理配置
  other.forEach(item => {
    Object.assign(proxy, createProxyItem(item));
  });

  return proxy;
}

/**
 * 创建单个代理项
 *
 * @param item - 服务配置项
 * @returns 代理配置对象
 */
function createProxyItem(item: App.Service.ServiceConfigItem) {
  const proxy: Record<string, ProxyOptions> = {};

  proxy[item.proxyPattern] = {
    target: item.baseURL, // 目标URL
    changeOrigin: true, // 是否更改源
    rewrite: path => path.replace(new RegExp(`^${item.proxyPattern}`), '') // 重写路径
  };

  return proxy;
}
