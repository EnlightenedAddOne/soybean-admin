import { useTitle } from '@vueuse/core';
import type { Router } from 'vue-router';
import { $t } from '@/locales';

/**
 * 创建文档标题守卫
 *
 * 在路由切换完成后更新文档标题：
 *
 * - 如果路由元信息中有i18nKey，则使用国际化翻译
 * - 否则直接使用title字段的值
 *
 * @param router - 路由实例
 */
export function createDocumentTitleGuard(router: Router) {
  router.afterEach(to => {
    const { i18nKey, title } = to.meta;

    // 优先使用国际化翻译，否则使用原始标题
    const documentTitle = i18nKey ? $t(i18nKey) : title;

    useTitle(documentTitle);
  });
}
