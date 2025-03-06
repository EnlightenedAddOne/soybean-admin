import { $t } from '@/locales';

/**
 * 将记录转换为选项
 *
 * @example
 *   ```ts
 *   const record = {
 *     key1: 'label1',
 *     key2: 'label2'
 *   };
 *   const options = transformRecordToOption(record);
 *   // [
 *   //   { value: 'key1', label: 'label1' },
 *   //   { value: 'key2', label: 'label2' }
 *   // ]
 *   ```;
 *
 * @param record 要转换的记录对象
 * @returns 转换后的选项数组
 */
export function transformRecordToOption<T extends Record<string, string>>(record: T) {
  return Object.entries(record).map(([value, label]) => ({
    value,
    label
  })) as CommonType.Option<keyof T>[];
}

/**
 * 翻译选项 将选项的标签翻译为对应的语言文本
 *
 * @param options 要翻译的选项数组
 * @returns 翻译后的选项数组
 */
export function translateOptions(options: CommonType.Option<string>[]) {
  return options.map(option => ({
    ...option,
    label: $t(option.label as App.I18n.I18nKey)
  }));
}

/**
 * 切换HTML类名 提供添加和移除HTML根元素类名的方法
 *
 * @param className 要切换的类名
 * @returns 包含add和remove方法的对象
 */
export function toggleHtmlClass(className: string) {
  /** 添加类名 */
  function add() {
    document.documentElement.classList.add(className);
  }

  /** 移除类名 */
  function remove() {
    document.documentElement.classList.remove(className);
  }

  return {
    add,
    remove
  };
}

/**
 * 获取数据类型 返回数据的具体类型字符串
 *
 * @param data 要检查的数据
 * @returns 数据类型字符串
 */
export function getDataType(data: unknown) {
  return Object.prototype.toString.call(data).slice(8, -1);
}

/**
 * 判断数据是否为某个类型
 *
 * @param data 要检查的数据
 * @param type 期望的数据类型
 * @returns 是否为指定类型
 */
export function isDataType<T>(data: T, type: string) {
  return getDataType(data) === type;
}

/**
 * 加载脚本 动态加载外部JavaScript文件
 *
 * @param url 脚本的URL地址
 * @returns Promise对象，加载成功时resolve
 */
export function loadScript(url: string) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.onload = resolve;
    script.onerror = reject;
    script.src = url;
    document.head.appendChild(script);
  });
}

/**
 * 获取随机整数 生成指定范围内的随机整数
 *
 * @param min 最小值
 * @param max 最大值
 * @returns 随机整数
 */
export function getRandomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
