import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

/**
 * 获取构建时间
 *
 * @returns 格式化后的构建时间字符串
 */
export function getBuildTime() {
  dayjs.extend(utc); // 扩展UTC插件
  dayjs.extend(timezone); // 扩展时区插件

  // 获取当前时间并格式化为上海时区的时间字符串
  const buildTime = dayjs.tz(Date.now(), 'Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss');

  return buildTime;
}
