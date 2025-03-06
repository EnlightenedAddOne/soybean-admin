/** Pinia 状态管理配置文件 */

import type { App } from 'vue';
import { createPinia } from 'pinia';
import { resetSetupStore } from './plugins';

/**
 * 配置 Pinia 状态管理
 *
 * 1. 创建 Pinia 实例
 * 2. 使用自定义插件 resetSetupStore
 * 3. 将 Pinia 挂载到 Vue 应用
 *
 * @param app - Vue应用实例
 */
export function setupStore(app: App) {
  // 创建 Pinia 实例
  const store = createPinia();

  // 使用重置状态插件
  store.use(resetSetupStore);

  // 将 Pinia 挂载到 Vue 应用
  app.use(store);
}
