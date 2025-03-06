/** 用户代理工具函数 用于检测当前设备类型 */

/**
 * 判断当前设备是否为PC
 *
 * @returns {boolean} 如果是PC设备返回true，移动设备返回false
 */
export function isPC() {
  // 移动设备的用户代理标识列表
  const agents = ['Android', 'iPhone', 'webOS', 'BlackBerry', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod'];

  // 检查当前用户代理是否包含移动设备标识
  const isMobile = agents.some(agent => window.navigator.userAgent.includes(agent));

  return !isMobile;
}
