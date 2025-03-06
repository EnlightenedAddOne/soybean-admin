import { h } from 'vue';
import type { App } from 'vue';
import { NButton } from 'naive-ui';
import { $t } from '@/locales';

/**
 * 设置应用全局错误处理
 *
 * @param app - Vue应用实例
 */
export function setupAppErrorHandle(app: App) {
  app.config.errorHandler = (err, vm, info) => {
    // eslint-disable-next-line no-console
    console.error(err, vm, info);
  };
}

/**
 * 设置应用版本更新通知
 *
 * 1. 自动检测生产环境版本更新
 * 2. 通过轮询检查index.html的构建时间
 * 3. 检测到更新时显示通知弹窗
 */
export function setupAppVersionNotification() {
  // 更新检查间隔（3分钟）
  const UPDATE_CHECK_INTERVAL = 3 * 60 * 1000;

  // 判断是否启用自动更新检测（生产环境且配置为Y）
  const canAutoUpdateApp = import.meta.env.VITE_AUTOMATICALLY_DETECT_UPDATE === 'Y' && import.meta.env.PROD;
  if (!canAutoUpdateApp) return;

  let isShow = false; // 是否正在显示更新提示
  let updateInterval: ReturnType<typeof setInterval> | undefined;

  /** 检查版本更新 */
  const checkForUpdates = async () => {
    if (isShow) return;

    // 获取最新的构建时间
    const buildTime = await getHtmlBuildTime();

    // 构建时间未变化则无需更新
    if (buildTime === BUILD_TIME) {
      return;
    }

    isShow = true;

    // 显示更新通知弹窗
    const n = window.$notification?.create({
      title: $t('system.updateTitle'),
      content: $t('system.updateContent'),
      action() {
        return h('div', { style: { display: 'flex', justifyContent: 'end', gap: '12px', width: '325px' } }, [
          h(
            NButton,
            {
              onClick() {
                n?.destroy();
                isShow = false;
              }
            },
            () => $t('system.updateCancel')
          ),
          h(
            NButton,
            {
              type: 'primary',
              onClick() {
                location.reload();
              }
            },
            () => $t('system.updateConfirm')
          )
        ]);
      },
      onClose() {
        isShow = false;
      }
    });
  };

  /** 启动定时检查 */
  const startUpdateInterval = () => {
    if (updateInterval) {
      clearInterval(updateInterval);
    }
    updateInterval = setInterval(checkForUpdates, UPDATE_CHECK_INTERVAL);
  };

  // 当页面可见时启动检查
  if (!isShow && document.visibilityState === 'visible') {
    // 监听页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        checkForUpdates();
        startUpdateInterval();
      }
    });

    // 立即启动检查
    startUpdateInterval();
  }
}

/**
 * 获取index.html的构建时间
 *
 * @returns 构建时间字符串
 */
async function getHtmlBuildTime() {
  const baseUrl = import.meta.env.VITE_BASE_URL || '/';

  // 获取带时间戳的index.html
  const res = await fetch(`${baseUrl}index.html?time=${Date.now()}`);
  const html = await res.text();

  // 从meta标签解析构建时间
  const match = html.match(/<meta name="buildTime" content="(.*)">/);
  const buildTime = match?.[1] || '';

  return buildTime;
}
