import json5 from 'json5';

/**
 * 根据当前环境创建服务配置
 *
 * 该函数处理环境变量中的服务基础URL配置，包括主服务和其他服务的URL
 *
 * @param env 当前环境变量对象
 * @returns 返回服务配置对象
 */
export function createServiceConfig(env: Env.ImportMeta) {
  const { VITE_SERVICE_BASE_URL, VITE_OTHER_SERVICE_BASE_URL } = env;

  // 初始化其他服务的URL配置对象
  let other = {} as Record<App.Service.OtherBaseURLKey, string>;
  try {
    // 尝试解析其他服务的URL配置（JSON5格式）
    other = json5.parse(VITE_OTHER_SERVICE_BASE_URL);
  } catch {
    // eslint-disable-next-line no-console
    console.error('VITE_OTHER_SERVICE_BASE_URL不是有效的JSON5字符串');
  }

  // 创建基础HTTP配置
  const httpConfig: App.Service.SimpleServiceConfig = {
    baseURL: VITE_SERVICE_BASE_URL,
    other
  };

  // 获取其他服务的键名列表
  const otherHttpKeys = Object.keys(httpConfig.other) as App.Service.OtherBaseURLKey[];

  // 转换其他服务配置为标准格式
  const otherConfig: App.Service.OtherServiceConfigItem[] = otherHttpKeys.map(key => {
    return {
      key,
      baseURL: httpConfig.other[key],
      proxyPattern: createProxyPattern(key)
    };
  });

  // 构建最终的服务配置
  const config: App.Service.ServiceConfig = {
    baseURL: httpConfig.baseURL,
    proxyPattern: createProxyPattern(),
    other: otherConfig
  };

  return config;
}

/**
 * 获取后端服务的基础URL
 *
 * 根据是否使用代理返回相应的服务URL配置
 *
 * @param env 当前环境变量对象
 * @param isProxy 是否使用代理
 * @returns 返回基础URL和其他服务URL的配置对象
 */
export function getServiceBaseURL(env: Env.ImportMeta, isProxy: boolean) {
  const { baseURL, other } = createServiceConfig(env);

  // 初始化其他服务的URL配置对象
  const otherBaseURL = {} as Record<App.Service.OtherBaseURLKey, string>;

  // 根据是否使用代理设置URL
  other.forEach(item => {
    otherBaseURL[item.key] = isProxy ? item.proxyPattern : item.baseURL;
  });

  return {
    baseURL: isProxy ? createProxyPattern() : baseURL,
    otherBaseURL
  };
}

/**
 * 创建后端服务的代理模式URL
 *
 * 根据服务键名生成对应的代理URL模式
 *
 * @param key 服务键名，如果未设置则使用默认键名
 * @returns 返回代理URL模式字符串
 */
function createProxyPattern(key?: App.Service.OtherBaseURLKey) {
  if (!key) {
    return '/proxy-default';
  }

  return `/proxy-${key}`;
}
