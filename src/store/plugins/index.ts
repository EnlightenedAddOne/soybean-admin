import type { PiniaPluginContext } from 'pinia';
import { jsonClone } from '@sa/utils';
import { SetupStoreId } from '@/enum';

/**
 * Pinia状态重置插件
 *
 * 该插件用于重置使用setup语法编写的store状态
 *
 * 1. 检查store是否使用setup语法编写
 * 2. 如果是，克隆初始状态作为默认值
 * 3. 重写store的$reset方法，使用默认值进行状态重置
 *
 * @param context - Pinia插件上下文
 */
export function resetSetupStore(context: PiniaPluginContext) {
  // 获取所有使用setup语法的store ID
  const setupSyntaxIds = Object.values(SetupStoreId) as string[];

  // 判断当前store是否使用setup语法
  if (setupSyntaxIds.includes(context.store.$id)) {
    // 获取store当前状态
    const { $state } = context.store;

    // 深克隆当前状态作为默认值
    const defaultStore = jsonClone($state);

    // 重写$reset方法，使用默认值重置状态
    context.store.$reset = () => {
      context.store.$patch(defaultStore);
    };
  }
}
